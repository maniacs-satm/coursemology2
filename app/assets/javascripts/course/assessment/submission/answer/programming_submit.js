(function($) {
  'use strict';
  var DOCUMENT_SELECTOR = '.course-assessment-submission-submissions.edit ';
  var DELAY = 500; // Delay between each job request in ms.

  function onAnswerSubmit(e) {
    e.preventDefault();

    var answerId = e.target.value;
    showSpinner($(this));
    hideErrorMessage(answerId);
    submitFormAndWaitForJob($('.edit_submission'), answerId);
  }

  // Find all the spinning jobs in the page and check their statuses.
  function checkSubmittedJobs() {
    $('a.btn.submitted').filter(DOCUMENT_SELECTOR + '*').each(function(index) {
      var answer = $(this).closest('.answer');
      var jobUrl = $(this).data('job-path');
      var answerId = answer.data('answer-id');
      // Use different delays, so that all the requests won't send at once.
      waitForJob(jobUrl, answerId, (index + 1) * DELAY);
    });
  }

  function submitFormAndWaitForJob($form, answerId) {
    var action = $form.attr('action');
    var method = $form.attr('method');

    var data = $form.serializeArray();
    data.push({name: 'attempting_answer_id', value: answerId});
    $.ajax({
      url: action,
      method: method,
      data: $.param(data),
      dataType: 'json',
      global: false
    }).done(function(data) {
      waitForJob(data.redirect_url, answerId);
    });
  }

  function waitForJob(url, answerId, delay) {
    setTimeout(function() {
      $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        global: false
      }).done(function(data) {
        onGetJobSuccess(data, url, answerId);
      }).fail(function() {
        // Error message is rendered by the answer.
        reloadAnswer(answerId);
      })
    }, delay || DELAY);
  }

  function onGetJobSuccess(data, url, answerId) {
    if (data.status == 'completed') {
      reloadAnswer(answerId);
    } else if (data.status == 'submitted') {
      waitForJob(url, answerId);
    }
  }

  function reloadAnswer(answerId) {
    $.ajax({
      url: 'reload_answer',
      method: 'POST',
      data: { answer_id: answerId },
      global: false
    });
  }

  function showSpinner($button) {
    $button.prop('disabled', true);
    $button.append('<i class="fa fa-spinner fa-lg fa-spin"></i>');
  }

  function hideErrorMessage(answerId) {
    $('div#answer_' + answerId).find('p.bg-danger').hide();
  }

  $(document).on('click', DOCUMENT_SELECTOR + '.btn.submit-answer', onAnswerSubmit);
  $(document).on('turbolinks:load', checkSubmittedJobs);

})(jQuery);
