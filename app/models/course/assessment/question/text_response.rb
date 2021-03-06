# frozen_string_literal: true
class Course::Assessment::Question::TextResponse < ActiveRecord::Base
  acts_as :question, class_name: Course::Assessment::Question.name

  validate :validate_grade

  has_many :solutions, class_name: Course::Assessment::Question::TextResponseSolution.name,
                       dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  accepts_nested_attributes_for :solutions

  def auto_gradable?
    !solutions.empty?
  end

  def auto_grader
    Course::Assessment::Answer::TextResponseAutoGradingService.new
  end

  def attempt(submission, last_attempt = nil)
    answer = submission.text_response_answers.build(submission: submission, question: question)
    answer.answer_text = last_attempt.answer_text if last_attempt
    answer.acting_as
  end

  private

  def validate_grade
    errors.add(:maximum_grade, :invalid_grade) if solutions.any? { |s| s.grade > maximum_grade }
  end
end
