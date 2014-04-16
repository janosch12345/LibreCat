function linkPevz(element){
	var lineId = $(element).attr('id').replace('id_linkPevz_','');
	
	// Someone unchecked the "Link to PEVZ Account" checkbox
	if(!$(element).is(':checked')){
		// So, release input fields and change img back to gray
		$('#auAuthorized' + lineId).attr('src','/images/biNotAuthorized.png');
		$('#id_au_auLuAuthorOId_' + lineId + ', #id_au_auPersonNumber_' + lineId).val("");
		$('#id_au_auGivenName_' + lineId + ', #id_au_auSurname_' + lineId + ', #id_au_auPersonTitle_' + lineId).removeAttr("readonly");
		var origGivenName = $('#id_au_origGivenName_' + lineId).val();
		var origSurname = $('#id_au_origLastName_' + lineId).val();
		var origTitle = $('#id_au_origTitle_' + lineId).val();
		if(origGivenName){
			$('#id_au_auGivenName_' + lineId).val(origGivenName);
			$('#id_au_origGivenName_' + lineId).val("");
		}
		if(origSurname){
			$('#id_au_auSurname_' + lineId).val(origSurname);
			$('#id_au_origLastName_' + lineId).val("");
		}
		if(origTitle){
			$('#id_au_auTitle_' + lineId).val(origTitle);
			$('#id_au_origTitle_' + lineId).val("");
		}
	}
	
	// Someone checked the "Link to PEVZ Account" checkbox
	else{
		var puburl = 'http://pub-dev.ub.uni-bielefeld.de:3000/myPUB/search_researcher?ftext=';
		var narrowurl = puburl;
		var givenName = $('#id_au_auGivenName_' + lineId).val();
		$('#id_au_origGivenName_' + lineId).val(givenName);
		var givenname = givenName.toLowerCase();
		var surName = $('#id_au_auSurname_' + lineId).val();
		$('#id_au_origLastName_' + lineId).val(surName);
		var surname = surName.toLowerCase();
		var Title = $('#id_au_auTitle_' + lineId).val();
		$('#id_au_origTitle_' + lineId).val(Title);
		if(givenname){
			narrowurl += "givenname=" + givenname + "*";
		}
		if(givenname && surname){
			narrowurl += " AND ";
		}
		if(surname){
			narrowurl += "surname=*" + surname + "*";
		}
		
		$.get(narrowurl, function(response) {
			var objJSON = eval("(function(){return " + response + ";})()");

			// If only one hit... fill out fields and change img to green
			if(objJSON.length == 1){
				var data = objJSON[0];
				var pevzId = "";
				var sbcatId = "";
				var firstName = "";
				var lastName = "";
				var title = "";
				
				$.each(data, function(key, value){
					if(key == "personNumber"){
						pevzId = value;
					}
					if(key == "sbcatId"){
						sbcatId = value;
					}
					if(key == "givenName"){
						firstName = value;
					}
					if(key == "surname"){
						lastName = value;
					}
					if(key == "title"){
						title = value;
					}
				});
				
				$('#id_au_auLuAuthorOId_' + lineId).val(sbcatId);
				$('#id_au_auPersonNumber_' + lineId).val(pevzId);
				$('#id_au_auGivenName_' + lineId).val(firstName);
				$('#id_au_auSurname_' + lineId).val(lastName);
				if(title != ""){
					$('#id_au_auPersonTitle_' + lineId).val(title);
				}
				$('#id_au_auGivenName_' + lineId + ', #id_au_auSurname_' + lineId + ', #id_au_auPersonTitle_' + lineId).attr("readonly","readonly");
				$('#auAuthorized' + lineId).attr('src','/images/biAuthorized.png');
				$('#id_au_auGivenName_' + lineId + ', #id_au_auSurname_' + lineId).parent().removeClass("has-error");
				
				pevzId = "";
				sbcatId = "";
				firstName = "";
				lastName = "";
				title = "";
			}
			
			// If more than one hit... show modal with choices
			else if(objJSON.length > 1){
				var container = $('#linkPevzModal').find('.modal-body').first();
				container.html('');
				var table = '<p><strong>Exact hits:</strong></p><table class="table table-striped" id="lineId' + lineId + '"><tr><th>PEVZ-ID</th><th>Title</th><th>Name</th></tr>';
				var rows = "";
				var table2 = '<p><strong>Further hits:</strong></p><table class="table table-striped" id="lineId' + lineId + '"><tr><th>PEVZ-ID</th><th>Title</th><th>Name</th></tr>';
				var rows2 = "";
				
				for(var i=0;i<objJSON.length;i++){
					var data = objJSON[i];
					var pevzId = "";
					var sbcatId = "";
					var firstName = "";
					var lastName = "";
					var title = "";
					$.each(data, function(key, value){
						if(key == "pevzId"){
							pevzId = value;
						}
						if(key == "sbcatId"){
							sbcatId = value;
						}
						if(key == "firstName"){
							firstName = value;
							firstNameLc = value.toLowerCase();
						}
						if(key == "lastName"){
							lastName = value;
							lastNameLc = value.toLowerCase();
						}
						if(key == "title"){
							title = value;
						}
					});
					
					if((givenname == firstName.toLowerCase() && surname == "") || (surname == lastName.toLowerCase() && givenname == "") || (surname == lastName.toLowerCase() && givenname == firstName.toLowerCase())){
						rows += '<tr data-id="' + pevzId + '" data-sbcat="' + sbcatId + '"><td><a href="#" class="pevzLink">' + pevzId + '</a></td><td class="title">' + title + '</td><td class="name" data-firstname="' + firstName + '" data-lastname="' + lastName + '"><a href="#" class="pevzLink">' + firstName + " " + lastName + '</a></td></tr>';
					}
					else {
						rows2 += '<tr data-id="' + pevzId + '" data-sbcat="' + sbcatId + '"><td><a href="#" class="pevzLink">' + pevzId + '</a></td><td class="title">' + title + '</td><td class="name" data-firstname="' + firstName + '" data-lastname="' + lastName + '"><a href="#" class="pevzLink">' + firstName + " " + lastName + '</a></td></tr>';
					}
					
				}
				
				if(rows == ""){
					table = "<p><strong>Exact hits:</strong></p><p>There were no exact hits for <em>'" + givenname + " " + surname + "'</em>.</p>";
				}
				else{
					table += rows + "</table>";
				}
				
				if(rows2 == ""){
					table2 = "";
				}
				else {
					table2 += rows2 + "</table>";
				}

				container.append(table);
				container.append(table2);
				
				$('.pevzLink').bind("click", function() {
					var pevzId = $(this).parent().parent().attr('data-id');
					var sbcatId = $(this).parent().parent().attr('data-sbcat');
					var title = $(this).parent().parent().find('.title').text();
					var firstName = $(this).parent().parent().find('.name').attr('data-firstname');
					var lastName = $(this).parent().parent().find('.name').attr('data-lastname');
					
					var lineId = $(this).parents('.table').attr('id').replace('lineId','');
					
					$('#id_au_auPersonNumber_' + lineId).val(pevzId);
					$('#id_au_auGivenName_' + lineId).val(firstName);
					$('#id_au_auSurname_' + lineId).val(lastName);
					if(title != ""){
						$('#id_au_auPersonTitle_' + lineId).val(title);
					}
					$('#id_au_auGivenName_' + lineId + ', #id_au_auSurname_' + lineId + ', #id_au_auPersonTitle_' + lineId).attr("readonly","readonly");
					
					$('#auAuthorized' + lineId).attr('src','/images/biAuthorized.png');
					$('#id_au_auGivenName_' + lineId + ', #id_au_auSurname_' + lineId).parent().removeClass("has-error");
					$('#linkPevzModal').modal("hide");
					$('#linkPevzModal').find('.modal-body').first().html('');
				});

				$('#linkPevzModal').modal("show");
			}
			
			// No results found
			else {
				var container = $('#linkPevzModal').find('.modal-body').first();
				container.html('');
				container.append('<p class="has-error">No results found.</p>');
				$('#linkPevzModal').modal("show");
			}
		});
	}
}

function editAuthorIds(direction){
	if(direction == "edit"){
		$('.authorIds').css('display','none');
		$('.authorIds_input').attr('style','display:display');
	}
	else if(direction == "cancel"){
		$('.authorIds').attr('style','display:display');
		$('.authorIds_input').attr('style','display:none');
	}
}