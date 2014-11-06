"use strict";
$(function(){
	//Based on http://crosscloud.org/0.1.1/example/hello
    $("#error").html("");  // clear the "Missing Javascript" error message

    var pod = crosscloud.connect();
    var myMessages = [];
	var messages=[]
	messages[pod.loggedInURL]=[]
    var sendMessage = function () {
        
        var thisMessage = { isChatMessage: 0.1,
                            body: "Hello, World!",
							recipients: [],
                            when: (new Date()).toISOString()
                          };	//Data to be stored on your pod
        
        var recipients = $("#recipient").val()
        var body = $("#message").val()
		thisMessage.recipients=[recipients]	//For now, this can only have one recipient
		thisMessage.body=body
        
        myMessages.push(thisMessage);
        pod.push(thisMessage);
        
    };


    // allow the enter key to be a submit as well
    $("#message").keypress(function (e) {
        if (e.which == 13) {
            $("#send").click();
            return false;
        }
    });
	$("#send").click(sendMessage);
    var show = 5;
	var organizeMessages = function (items)	//Sort all messages by other party
	{
		messages=[]
		items.forEach(function(item)
		{
			if(item._owner==pod.loggedInURL)
			{
				item.recipients.forEach(function(recipient)
				{
					if(messages[recipient.replace("http://","")])
					{
						messages[recipient.replace("http://","")].push(item)
					}
					else
					{
						messages[recipient.replace("http://","")]=[item]
					}
				});
			}
			else
			{
				item.recipients.forEach(function (recipient)
				{
					if(recipient==pod.loggedInURL.replace("http://",""))
					{
						if(messages[item._owner.replace("http://","")])
						{
							messages[item._owner.replace("http://","")].push(item)
						}
						else
						{
							messages[item._owner.replace("http://","")]=[item]
						}
					}
				});
			}
		});
		displayMessages();
	}
    var displayMessages = function () {
		$("#out").html("<table id='results'><tr><th>Link</th><th>Sent</th><th>From</th><th>To</th></tr></table>");
		var table = $("#results");
		var currentRecipient=$("#recipient").val()
		var items=messages[currentRecipient]||[]
		items.sort(function(a,b){return a.when<b.when?1:(a.when===b.when?0:-1)});
		var count = 0;
		if(currentRecipient=="")
		{
			$("#send").prop('disabled', true);
		}
		else
		{
			$("#send").prop('disabled', false);
			items.forEach(function(item) {
				count++;
				var row = $("<tr>");
				row.append($("<td>").html("<a href='"+item._id+"'>data</a>"));
				row.append($("<td>").text(item.when || "---"));
				row.append($("<td>").html("<a href='"+item._owner+"'>"+item._owner+"</a>"));
				row.append($("<td>").text(recipientList(item.recipients) || "(anon)"));
				row.append($("<td>").html(item.body));
				if (item._owner==pod.getUserId()) {
					row.append($("<td>").html("(you)"));
				}
				table.append(row)
			});
		}
    };

    pod.onLogin(function () {
        $("#out").html("waiting for data...");
        pod.onLogout(function () {
            organizeMessages([])
			$("#recipient").off("input");
			$("#send").prop('disabled', true);
        });

        pod.query()
            .filter( { isChatMessage:0.1 } )
            .onAllResults(organizeMessages)
            .start();
		$("#recipient").on("input",displayMessages);
    });

});
function recipientList(recipients)
{
	var str=""
	for(var i=0;i<recipients.length;i++)
	{
		if(i!=0)
		{
			str+=" & "
		}
		str+=recipients[i]
	}
	return str
}