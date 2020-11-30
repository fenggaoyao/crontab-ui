var fs = require('fs');

exports.getfiles=function(folder,callback){
    const responsedelay=50
    let readingdirectory='./scripts'
    if(!!folder) readingdirectory = `./scripts${folder}`;  
    const result=[];   

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
                                address:`${readingdirectory}/${value}`
                            }
                        )
                    }
                    ///
                    if(stats.isDirectory()){
                        result.push(
                            {
                                url:`/file?folder=${url}`,
                                value:"目录",
                                filesize:"",
                                address:`${readingdirectory}/${value}`
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

function ConvertSize(number)
{
    if(number <= 1024) { return (`${number} Byte`); }
    else if(number > 1024 && number <= 1048576) { return ((number / 1024).toPrecision(3) + ' KB'); }
    else if(number > 1048576 && number <= 1073741824) { return ((number / 1048576).toPrecision(3) + ' MB'); }
    else if(number > 1073741824 && number <= 1099511627776) { return ((number / 1073741824).toPrecision(3) + ' GB'); }
}	