/*jshint esversion: 6 */
/*********** MessageBox ****************/
// simply show info.  Only close button
function infoMessageBox(message, title){
	$("#info-body").html(message);
	$("#info-title").html(title);
	$("#info-popup").modal('show');
}
// like info, but for errors.
function errorMessageBox(message) {
	var msg =
		"操作失败: " + message + ". " +
		"请查看Log文件.";
	infoMessageBox(msg, "错误");
}
// modal with full control
function messageBox(body, title, ok_text, close_text, callback){
	$("#modal-body").html(body);
	$("#modal-title").html(title);
	if (ok_text) $("#modal-button").html(ok_text);
	if(close_text) $("#modal-close-button").html(close_text);
	$("#modal-button").unbind("click"); // remove existing events attached to this
	$("#modal-button").click(callback);
	$("#popup").modal("show");
}


function git_sync(){
	messageBox("<p> 你正在删除脚本和重新git clone </p>", "确认初始化", null, null, function(){
		$.get(routes.gitSync, {}, function(){
			location.reload();
		});
	});

}

/*********** crontab actions ****************/
// TODO get rid of global variables
var schedule = "";
var job_command = "";

function deleteJob(_id){
	// TODO fix this. pass callback properly
	messageBox("<p> 你正在删除该任务? </p>", "确认删除", null, null, function(){
		$.post(routes.remove, {_id: _id}, function(){
			location.reload();
		});
	});
}

function stopJob(_id){
	messageBox("<p> 你正在停止该任务? ? </p>", "确认停止任务", null, null, function(){
		$.post(routes.stop, {_id: _id}, function(){
			location.reload();
		});
	});
}

function startJob(_id){
	messageBox("<p> 您要运行此任务吗? </p>", "确认运行任务", null, null, function(){
		$.post(routes.start, {_id: _id}, function(){
			location.reload();
		});
	});
}

function runJob(_id){
	messageBox("<p> 您要运行此作业吗? </p>", "确认运行作业", null, null, function(){
		$.post(routes.run, {_id: _id}, function(){
			location.reload();
		});
		
	});
}

function setCrontab(){
	messageBox("<p> 你正在设置 crontab 文件? </p>", "确认任务设置", null, null, function(){
		$.get(routes.crontab, { "env_vars": $("#env_vars").val() }, function(){
			// TODO show only if success
			infoMessageBox("成功设置任务!","消息");
			location.reload();
		}).fail(function(response) {
			errorMessageBox(response.statusText,"Error");
		});
	});
}

function getCrontab(){
	messageBox("<p> 你正在获取crontab 文件? <br /> <b style='color:red'>注意：建议在此之前进行备份。</ b>然后在此之后刷新页面。</p>", "确认crontab检索", null, null, function(){
		$.get(routes.import_crontab, { "env_vars": $("#env_vars").val() }, function(){
			// TODO show only if success
			infoMessageBox("成功获取crontab文件!","消息");
			location.reload();
		});
	});
}

function editJob(_id){
	var job = null;
	crontabs.forEach(function(crontab){
		if(crontab._id == _id)
			job = crontab;
	});
	if(job){
		$("#job").modal("show");
		$("#job-name").val(job.name);
		$("#job-command").val(job.command);
		// if macro not used
		if(job.schedule.indexOf("@") !== 0){
			var components = job.schedule.split(" ");
			$("#job-minute").val(components[0]);
			$("#job-hour").val(components[1]);
			$("#job-day").val(components[2]);
			$("#job-month").val(components[3]);
			$("#job-week").val(components[4]);
		}
		if (job.mailing) {
			$("#job-mailing").attr("data-json", JSON.stringify(job.mailing));
		}
		schedule = job.schedule;
		job_command = job.command;
		if (job.logging && job.logging != "false")
			$("#job-logging").prop("checked", true);
		job_string();
	}

	$("#job-save").unbind("click"); // remove existing events attached to this
	$("#job-save").click(function(){
		// TODO good old boring validations
		if (!schedule) {
			schedule = "* * * * *";
		}
		let name = $("#job-name").val();
		let mailing = JSON.parse($("#job-mailing").attr("data-json"));
		let logging = $("#job-logging").prop("checked");
		$.post(routes.save, {name: name, command: job_command , schedule: schedule, _id: _id, logging: logging, mailing: mailing}, function(){
			location.reload();
		});
	});
}

function newJob(){
	schedule = "";
	job_command = "";
	$("#job-minute").val("*");
	$("#job-hour").val("*");
	$("#job-day").val("*");
	$("#job-month").val("*");
	$("#job-week").val("*");

	$("#job").modal("show");
	$("#job-name").val("");
	$("#job-command").val("");
	$("#job-mailing").attr("data-json", "{}");
	job_string();
	$("#job-save").unbind("click"); // remove existing events attached to this
	$("#job-save").click(function(){
		// TODO good old boring validations
		if (!schedule) {
			schedule = "* * * * *";
		}
		let name = $("#job-name").val();
		let mailing = JSON.parse($("#job-mailing").attr("data-json"));
		let logging = $("#job-logging").prop("checked");
		$.post(routes.save, {name: name, command: job_command , schedule: schedule, _id: -1, logging: logging, mailing: mailing}, function(){
			location.reload();
		});
	});
}

function doBackup(){
	messageBox("<p> 您要备份吗？ </p>", "确认备份", null, null, function(){
		$.get(routes.backup, {}, function(){
			location.reload();
		});
	});
}

function delete_backup(db_name){
	messageBox("<p> 你要删除备份吗? </p>", "确定删除", null, null, function(){
		$.get(routes.delete_backup, {db: db_name}, function(){
			location = routes.root;
		});
	});
}

function restore_backup(db_name){
	messageBox("<p> 你要恢复备份吗? </p>", "确认恢复", null, null, function(){
		$.get(routes.restore_backup, {db: db_name}, function(){
			location = routes.root;
		});
	});
}

function import_db(){
	messageBox("<p> 您是否要导入crontab?<br /> <b style='color:red'>注意：建议在此之前进行备份。</b> </p>", "确认从crontab导入", null, null, function(){
		$('#import_file').click();
	});
}

function setMailConfig(a){
	let data = JSON.parse(a.getAttribute("data-json"));
	let container = document.createElement("div");

	let message = "<p>This is based on nodemailer. Refer <a href='http://lifepluslinux.blogspot.com/2017/03/introducing-mailing-in-crontab-ui.html'>this</a> for more details.</p>";
	container.innerHTML += message;

	let transporterLabel = document.createElement("label");
	transporterLabel.innerHTML = "Transporter";
	let transporterInput = document.createElement("input");
	transporterInput.type = "text";
	transporterInput.id = "transporterInput";
	transporterInput.setAttribute("placeholder", config.transporterStr);
	transporterInput.className = "form-control";
	if (data.transporterStr){
		transporterInput.setAttribute("value", data.transporterStr);
	}
	container.appendChild(transporterLabel);
	container.appendChild(transporterInput);

	container.innerHTML += "<br/>";

	let mailOptionsLabel = document.createElement("label");
	mailOptionsLabel.innerHTML = "Mail Config";
	let mailOptionsInput = document.createElement("textarea");
	mailOptionsInput.setAttribute("placeholder", JSON.stringify(config.mailOptions, null, 2));
	mailOptionsInput.className = "form-control";
	mailOptionsInput.id = "mailOptionsInput";
	mailOptionsInput.setAttribute("rows", "10");
	if (data.mailOptions)
		mailOptionsInput.innerHTML = JSON.stringify(data.mailOptions, null, 2);
	container.appendChild(mailOptionsLabel);
	container.appendChild(mailOptionsInput);

	container.innerHTML += "<br/>";

	let button = document.createElement("a");
	button.className = "btn btn-primary btn-small";
	button.innerHTML = "Use Defaults";
	button.onclick = function(){
		document.getElementById("transporterInput").value = config.transporterStr;
		document.getElementById("mailOptionsInput").innerHTML = JSON.stringify(config.mailOptions, null, 2);
	};
	container.appendChild(button);

	let buttonClear = document.createElement("a");
	buttonClear.className = "btn btn-default btn-small";
	buttonClear.innerHTML = "Clear";
	buttonClear.onclick = function(){
		document.getElementById("transporterInput").value = "";
		document.getElementById("mailOptionsInput").innerHTML = "";
	};
	container.appendChild(buttonClear);

	messageBox(container, "Mailing", null, null, function(){
		let transporterStr = document.getElementById("transporterInput").value;
		let mailOptions;
		try{
			mailOptions = JSON.parse(document.getElementById("mailOptionsInput").value);
		} catch (err) {}

		if (transporterStr && mailOptions){
				a.setAttribute("data-json", JSON.stringify({transporterStr: transporterStr, mailOptions: mailOptions}));
		} else {
				a.setAttribute("data-json", JSON.stringify({}));
		}
	});
}

function setHookConfig(a){
	messageBox("<p>正在开发中</p>", "Hooks", null, null, null);
}

// script corresponding to job popup management
function job_string(){
	$("#job-string").val(schedule + " " + job_command);
	return schedule + " " + job_command;
}

function set_schedule(){
	schedule = $("#job-minute").val() + " " +$("#job-hour").val() + " " +$("#job-day").val() + " " +$("#job-month").val() + " " +$("#job-week").val();
	job_string();
}
// popup management ends


function uploadToServer(form, uploadProgressDisplayerId)
{
    let formData = new FormData(form);

    let xhr = new XMLHttpRequest();
    
    xhr.open(form.method, form.action, true);
    
    xhr.upload.addEventListener('progress', function(ev)
    {
        let progress = ev.loaded / ev.total * 100;

        if (ev.lengthComputable)
        {
            uploadProgressDisplayerId.style.width = `${progress}%`;

            if(progress == 100)
            {				
				alert('你的文件已成功上传');
				location.reload();
            }
        }
        else
        {
            uploadProgressDisplayerId.style.width = 0;
            console.log('the length is not calcutable!');
        }
    });

    xhr.send(formData);
}

function excuteCommand(){
	if(!!$("#command").val()){
		$.get(routes.command, { "env":$('#env_select').val(),"command": $("#command").val(),"env_vars": $("#env_vars").val() }, function(data, status){	
			$("#commandResult").text(data)
		}).fail(function(response) {
			errorMessageBox(response.statusText,"Error");
		});	
	}	
}
