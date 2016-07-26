$(document).ready(function() {
    $('#form').submit(function(event) {
        event.preventDefault();
        var $question = $(this).find('.question');
        var $answer = $(this).find('.answer');
        var data = {
            question: $question.val(),
            answer: $answer.val()
        };
        $.ajax({
            url: '/api',
            type: 'POST',
            data: data
        }).done(function(newFaq) {
            if (typeof newFaq === 'object') {
                $('.alert-success').show();
                $question.val('');
                $answer.val('');
                setTimeout(function() {
                    $('.alert-success').hide();
                }, 5000);
                console.log(newFaq)
                var htmlBody = '<div class="jumbotron" id="' + newFaq.id + '">\
                    <form>\
                      <fieldset class="form-group">\
                        <label for="question">Question</label>\
                        <input type="text" class="form-control question" value="' + newFaq.question + '" disabled required/>\
                      </fieldset>\
                      <fieldset class="form-group">\
                        <label for="answer">Answer</label>\
                        <textarea class="form-control answer" disabled required>' + newFaq.answer.replace(/<br\/>/g, '\n') + '</textarea>\
                      </fieldset>\
                      <button class="btn btn-primary" type="button"><i class="glyphicon glyphicon-pencil"></i> Edit</button>\
                      <button class="btn btn-success" type="submit"><i class="glyphicon glyphicon-floppy-disk"></i> Save</button>\
                      <button class="btn btn-default" type="button">Cancel</button>\
                      <button class="btn btn-danger" type="button"><i class="glyphicon glyphicon-trash"></i> Delete</button>\
                    </form>\
                </div>';
                $('#faq').append(htmlBody);
            } else {
                setTimeout(function(){
                    $('.alert-danger').show();
                }, 5000);
            }
        }).fail(function(err) {
            $('.alert-danger').show();
        });
    });
    
    $('#faq form .btn-primary').click(function() {
        $(this).hide();
        $(this).siblings('.btn-success').show();
        $(this).siblings('.btn-default').show();
        $(this).siblings('.form-group').children('.form-control').prop('disabled', false);
    });
    
    $('#faq form .btn-default').click(function() {
        $(this).hide();
        $(this).siblings('.btn-success').hide();
        $(this).siblings('.btn-primary').show();
        $(this).siblings('.form-group').children('.form-control').prop('disabled', true);
    });
    
    $('#faq form .btn-danger').click(function() {
        var id = $(this).parent().parent().attr('id');
        console.log(id);
        $.ajax({
            url: '/api',
            type: 'DELETE',
            data: {id: id}
        }).done(function(message) {
            if (message === 'success'){
                $('#' + id).remove();
            } else {
                alert('database error! please try again!');
            }
        }).fail(function() {
            alert('fail to delete! please try again!');
        });
    });
    
    $('#faq form').submit(function() {
        event.preventDefault();
        var $this = $(this);
        var data = {
            id: $(this).parent().attr('id'),
            question: $(this).find('.question').val(),
            answer: $(this).find('.answer').val()
        };
        $.ajax({
            url: '/api',
            type: 'PUT',
            data: data
        }).done(function(message) {
            if (message === 'success') {
                $this.find('.btn-success').hide();
                $this.find('.btn-default').hide();
                $this.find('.btn-primary').show();
                $this.find('.form-control').prop('disabled', true);
            } else {
                alert('database error! please try again!');
            }
        }).fail(function() {
            alert('fail to update! please try again!');
        });
    });
});