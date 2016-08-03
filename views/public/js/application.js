$(document).ready(function() {
    $('#form').submit(function(event) {
        event.preventDefault();
        var $this = $(this);
        $this.children('button').replaceWith('<button class="btn btn-primary form-control"><i class="glyphicon glyphicon-repeat glyphicon-spin"></i> Submitting...</button>');
        var formData = new FormData();
        formData.append('question', $this.find('input[name="question"]').val());
        formData.append('answer', $this.find('textarea[name="answer"]').val());
        formData.append('image', $this.find('input[name="image"]')[0].files[0]);
        $.ajax({
            url: '/api',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }).done(function(newFaq) {
            if (typeof newFaq === 'object') {
                $('.alert-success').show();
                $this.children('button').replaceWith('<button class="btn btn-primary form-control"><i class="glyphicon glyphicon-send"></i> Submit</button>');
                $this.find('input[name="question"]').val('');
                $this.find('textarea[name="answer"]').val('');
                $this.find('input[name="image"]').val('');
                setTimeout(function() {
                    $('.alert-success').hide();
                }, 5000);
                var htmlBody = '<div class="jumbotron" id="' + newFaq._id + '">\
                    <form>\
                      <fieldset class="form-group">\
                        <label for="question">Question</label>\
                        <input type="text" class="form-control question" value="' + newFaq.question + '" disabled required/>\
                      </fieldset>\
                      <fieldset class="form-group">\
                        <label for="answer">Answer</label>\
                        <textarea class="form-control answer" disabled required>' + newFaq.answer.replace(/<br\/>/g, '\n') + '</textarea>\
                      </fieldset>';
                if (newFaq.image) {
                    htmlBody += '<fieldset class="form-group">\
                        <button type="button" class="close">&times;</button>\
                        <label for="current-image">Current Image</label>\
                        <image class="img-responsive" src="' + newFaq.image + '"/>\
                      </fieldset>';
                }
                
                htmlBody += '<fieldset class="form-group">\
                        <label for="Image">Upload New Image</label>\
                        <input name="image" type="file" class="file" disabled/>\
                      </fieldset>\
                      <button class="btn btn-primary" type="button"><i class="glyphicon glyphicon-pencil"></i> Edit</button>\
                      <button class="btn btn-success" type="submit"><i class="glyphicon glyphicon-floppy-disk"></i> Save</button>\
                      <button class="btn btn-default" type="button">Cancel</button>\
                      <button class="btn btn-danger" type="button"><i class="glyphicon glyphicon-trash"></i> Delete</button>\
                    </form>\
                </div>';
                $('#faq').append(htmlBody);
                bindButtonsEvent();
            } else {
                $this.children('button').replaceWith('<button class="btn btn-primary form-control"><i class="glyphicon glyphicon-send"></i> Submit</button>');
                $('.alert-danger').show();
                setTimeout(function(){
                    $('.alert-danger').hide();
                }, 5000);
            }
        }).fail(function(err) {
            $this.children('button').replaceWith('<button class="btn btn-primary form-control"><i class="glyphicon glyphicon-send"></i> Submit</button>');
            $('.alert-danger').show();
            setTimeout(function(){
                $('.alert-danger').hide();
            }, 5000);
        });
    });
    function bindButtonsEvent() {
        $('#faq form .btn-primary').click(function() {
            $(this).hide();
            $(this).siblings('.btn-success').show();
            $(this).siblings('.btn-default').show();
            $(this).siblings('.form-group').children('.form-control').prop('disabled', false);
            $(this).siblings('.form-group').children('input[name="image"]').prop('disabled', false);
        });
        
        $('#faq form .btn-default').click(function() {
            $(this).hide();
            $(this).siblings('.btn-success').hide();
            $(this).siblings('.btn-primary').show();
            $(this).siblings('.form-group').children('.form-control').prop('disabled', true);
            $(this).siblings('.form-group').children('input[name="image"]').prop('disabled', true);
        });
        
        $('#faq form .btn-danger').click(function() {
            if (confirm('Are you sure want to delete this question?')){
                var $this = $(this);
                var id = $this.parent().parent().attr('id');
                $this.parent().children('.btn-danger').replaceWith('<button class="btn btn-danger" type="button"><i class="glyphicon glyphicon-repeat glyphicon-spin"></i> Deleting...</button>');
                $.ajax({
                    url: '/api',
                    type: 'DELETE',
                    data: {id: id}
                }).done(function(message) {
                    if (message === 'success'){
                        $('#' + id).remove();
                    } else {
                        $this.parent().children('.btn-danger').replaceWith('<button class="btn btn-danger" type="button"><i class="glyphicon glyphicon-trash"></i> Delete</button>');
                        bindButtonsEvent();
                        alert('database error! please try again!');
                    }
                }).fail(function() {
                    $this.parent().children('.btn-danger').replaceWith('<button class="btn btn-danger" type="button"><i class="glyphicon glyphicon-trash"></i> Delete</button>');
                    bindButtonsEvent();
                    alert('fail to delete! please try again!');
                });
            }
        });
        
        $('#faq .close').click(function() {
            var $this = $(this);
            $.ajax({
                url: '/api/image',
                type: 'DELETE',
                data: {id: $this.parent().parent().parent().attr('id')}
            }).done(function(res) {
                if (res === 'error') {
                    alert('Error! Please try removing the picture again!');
                } else {
                    $this.parent().remove();
                }
            }).fail(function() {
                alert('Server Error! Please try removing the picture again!');
            });
        });
    }
    
    $('#faq form').submit(function() {
        event.preventDefault();
        var $this = $(this);
        $this.children('.btn-success').replaceWith('<button class="btn btn-success" type="button" style="display: inline-block;"><i class="glyphicon glyphicon-repeat glyphicon-spin"></i> Saving...</button>');
        var formData = new FormData();
        formData.append('id', $this.parent().attr('id'));
        formData.append('question', $this.find('input[name="question"]').val());
        formData.append('answer', $this.find('textarea[name="answer"]').val());
        formData.append('image', $this.find('input[name="image"]')[0].files[0]);
        $.ajax({
            url: '/api',
            type: 'PUT',
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }).done(function(res) {
            if (typeof res === 'object') {
                $this.html('');
                var htmlBody = '<form>\
                                  <fieldset class="form-group">\
                                    <label for="question">Question</label>\
                                    <input name="question" type="text" class="form-control" value="' + res.question + '" disabled required/>\
                                  </fieldset>\
                                  <fieldset class="form-group">\
                                    <label for="answer">Answer</label>\
                                    <textarea name="answer" class="form-control" disabled required>' + res.answer.replace(/<br\/>/g, '\n') + '</textarea>\
                                  </fieldset>';
                if (res.image) {
                    htmlBody += '<fieldset class="form-group">\
                                    <button type="button" class="close">&times;</button>\
                                    <label for="current-image">Current Image</label>\
                                    <image class="img-responsive" src="' + res.image + '"/>\
                                  </fieldset>';
                }
                htmlBody += '<fieldset class="form-group">\
                               <label for="Image">Upload New Image</label>\
                               <input name="image" type="file" class="file" disabled/>\
                             </fieldset>\
                             <button class="btn btn-primary" type="button"><i class="glyphicon glyphicon-pencil"></i> Edit</button>\
                             <button class="btn btn-success" type="submit"><i class="glyphicon glyphicon-floppy-disk"></i> Save</button>\
                             <button class="btn btn-default" type="button">Cancel</button>\
                             <button class="btn btn-danger" type="button"><i class="glyphicon glyphicon-trash"></i> Delete</button>\
                           </form>';
                $this.html(htmlBody);
                bindButtonsEvent();
                
            } else if (res === 'error'){
                $this.children('.btn-success').replaceWith('<button class="btn btn-success" type="submit"><i class="glyphicon glyphicon-floppy-disk"></i> Save</button>');
                $this.children('.btn-success').show();
                alert('Server error! please try again!');
            }
        }).fail(function() {
            $this.children('.btn-success').replaceWith('<button class="btn btn-success" type="submit"><i class="glyphicon glyphicon-floppy-disk"></i> Save</button>');
            $this.children('.btn-success').show();
            alert('fail to update! please try again!');
        });
    });
    bindButtonsEvent();
});