# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UserAchievement, type: :model do
  it { is_expected.to belong_to(:course_user).inverse_of(:course_user_achievements) }
  it { is_expected.to belong_to(:achievement).inverse_of(:course_user_achievements) }

  describe '#initialize' do
    it 'sets the obtained timestamp' do
      expect(subject.obtained_at).to be_within(1.second).of(Time.zone.now)
    end
  end
end
