var fs = require('fs');
var path = require("path");
var exec = require('child_process').exec;

const scripts=path.join(__dirname,"scripts");

exports.getfiles=function(folder,callback){
    const responsedelay=50
    let readingdirectory='./scripts'
    if(!!folder) readingdirectory = `./scripts${folder}`;  
    const result=[]; 
    if(fs.existsSync(readingdirectory)){
        fs.readdir(readingdirectory, function(err, files)
        {    
            if(err) { console.log(err);  setTimeout(function() {callback(result);}, responsedelay); }
            else if(files.length > 0)
            {
                files.forEach(function(value, index, array)
                {
                    fs.stat(`${readingdirectory}/${value}`, function(err, stats)
                    {
                        const url=folder==undefined?`/${encodeURI(value)}`:`${folder}/${encodeURI(value)}`
                        if(stats.isFile()){
                            let filesize = ConvertSize(stats.size);
                            result.push(
                                {
                                    url:url,
                                    value:value,
                                    filesize:filesize,
                                    address:`/crontab-ui/scripts${url}`,
                                    mtime: new Date(stats.mtime.getTime()).toLocaleString()
                                }
                            )
                        }
                        ///
                        if(stats.isDirectory()){
                            result.push(
                                {
                                    url:`/file?folder=${url}`,
                                    value:value,
                                    filesize:"目录",
                                    address:`/crontab-ui/scripts${url}`,
                                    mtime:stats.mtime
                                }
                            )
                        }
                        if(index == (array.length - 1)) { setTimeout(function() {callback(result);}, responsedelay); }
                    });
                });
            }   
            else
            {
                setTimeout(function() {callback(result);}, responsedelay);
            }  
        });      

    }
    else
    {
        setTimeout(function() {callback(result);}, responsedelay);
    } 
}

exports.runCommand=function(env,env_vars,command,callback){  
    if(fs.existsSync(scripts)){ 
        if(env=='javascript')  command=`const Env=require('./../Env.min.js');
        var $ = new Env('');`+command
         if(env==='shell') command="cd scripts &&"+command;
        const command_file = env=="javascript"?path.join(scripts, 'command.js') : path.join(scripts, 'command.sh') ;       
        fs.writeFile(command_file, command, function(err){
            if (err) {
                console.error(err);
                callback(err);
            }
            try{
                //console.log("env_vars",env_vars)
                const shell=add_env_vars(env_vars,env,command_file);               
                //console.log(shell)
                exec(shell, function(err, stdout, stderr) {
                    if (err) {
                        //console.error(err);
                        callback(String(err));
                    }
                    else { 
                        // console.log("stdout",stdout)  
                        // console.log("stderr",stderr)  
                        if(stdout) 
                          callback(stdout);
                        if(stderr)
                          callback(stdout);                        
                    }
                }); 
            }
            catch(e){   
                throw e;  
            }    
         
        })
    }else{
        callback("脚本文件command.js|sh存储在scripts文件夹,要先初始化操作");
    }
}



function ConvertSize(number)
{
    if(number <= 1024) { return (`${number} Byte`); }
    else if(number > 1024 && number <= 1048576) { return ((number / 1024).toPrecision(3) + ' KB'); }
    else if(number > 1048576 && number <= 1073741824) { return ((number / 1048576).toPrecision(3) + ' MB'); }
    else if(number > 1073741824 && number <= 1099511627776) { return ((number / 1073741824).toPrecision(3) + ' GB'); }
}

 function add_env_vars(env_vars, env,command_file) {
    const command=(env=="javascript"? "node ":"sh ")+command_file
	if (env_vars)
		return "(export " + env_vars.replace(/\s*\n\s*/g,' ').trim() + "; (" + command + "))";	
	return command;
}