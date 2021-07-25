const Env=require('./Env.min.js')


async function getJdUrl(uname) {
  const $ = new Env('扫码获取京东cookie');

  let data=$.getjson(`@jdcookie.${uname}`,{})  
  //console.log(uname,data)
 // console.log(data)
  let qrcode=data.jdcookie;
  let islogin;
  if(qrcode){
    islogin=await TotalBean(qrcode,$);
  }
  //console.log(uname,!$.isLogin, !qrcode)
  if(!islogin || !qrcode){             
     // console.log("qrcode",qrcode)     
     const {s_token,cookies}=  await loginEntrance($);
     const {url,token,okl_token}= await generateQrcode(s_token,$); 
     //console.log({s_token,url,token,cookies,okl_token} )
     return {url,token,cookies,okl_token} 
  }
  return `${qrcode}获取日期：${$.time('yyyy-MM-dd qq HH:mm:ss',data.date)}`;
}

function loginEntrance($) {
    return new Promise((resolve) => {
      $.get(taskUrl(), async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`API请求失败，请检查网路重试`);
          } else {
            let headers = resp.headers;
            let body = JSON.parse(data);

            let s_token = body['s_token']
            let guid = headers['set-cookie'][0]
            guid = guid.substring(guid.indexOf("=") + 1, guid.indexOf(";"))
            let lsid = headers['set-cookie'][2]
            lsid = lsid.substring(lsid.indexOf("=") + 1, lsid.indexOf(";"))
            let lstoken = headers['set-cookie'][3]
            lstoken = lstoken.substring(lstoken.indexOf("=") + 1, lstoken.indexOf(";"))
            let cookies = "guid=" + guid + "; lang=chs; lsid=" + lsid + "; lstoken=" + lstoken + "; "
            resolve({s_token,cookies})
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve();
        }
      })
    })
  }



  function generateQrcode(s_token,$) {
    return new Promise((resolve) => {
      $.post(taskPostUrl(s_token), (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`API请求失败，请检查网路重试`);
          } else {
            
            data = JSON.parse(data);
            let token = data['token'];

            // $.log('token', token)
  
            const setCookie = resp.headers['set-cookie'][0];
            let okl_token = setCookie.substring(setCookie.indexOf("=") + 1, setCookie.indexOf(";"))
            let url = 'https://plogin.m.jd.com/cgi-bin/m/tmauth?appid=300&client_type=m&token=' + token;
            resolve({url,token,okl_token})
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve();
        }
      })
    })
  }


async function getCookie(uname,token,okl_token,cookies) {  
  const $ = new Env('扫码获取京东cookie');

  const {checkRes,headers} = await checkLogin(token,okl_token,cookies,$);
  
  var result='';
    if (checkRes['errcode'] === 0) {
      //扫描登录成功      
      let cookie=  await formatCookie(uname,headers,$);  
      result=`扫描登录成功,${cookie}`;
    } else if (checkRes['errcode'] === 21) {
      result=`二维码已失效，请重新获取二维码重新扫描`;     
    } else if (checkRes['errcode'] === 176) {
      result='未扫描登录'
    } else {
      result=`其他异常：${JSON.stringify(checkRes)}\n`;      
    }
    return result;
  }


  function checkLogin(token,okl_token,cookies,$) {
    return new Promise((resolve) => {
      const options = {
        url: `https://plogin.m.jd.com/cgi-bin/m/tmauthchecktoken?&token=${token}&ou_state=0&okl_token=${okl_token}`,
        body: `lang=chs&appid=300&source=wq_passport&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=${Date.now()}&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action`,
        headers: {
          'Referer': `https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=${Date.now()}&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport`,
          'Cookie': cookies,
          'Connection': 'Keep-Alive',
          'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
        }
      }
      $.post(options, (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`API请求失败，请检查网路重试`);
          } else {
            data = JSON.parse(data);
            // $.log(`errcode:${data['errcode']}`)
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve({"checkRes":data,"headers":resp.headers});
        }
      })
    })
  }
  
function formatCookie(uname,headers,$) {
   return new Promise(resolve => {
      let pt_key = headers['set-cookie'][1]
      pt_key = pt_key.substring(pt_key.indexOf("=") + 1, pt_key.indexOf(";"))
      let pt_pin = headers['set-cookie'][2]
      pt_pin = pt_pin.substring(pt_pin.indexOf("=") + 1, pt_pin.indexOf(";"))
      const cookie1 = "pt_key=" + pt_key + ";pt_pin=" + pt_pin + ";";  
      const UserName = decodeURIComponent(cookie1.match(/pt_pin=(.+?);/) && cookie1.match(/pt_pin=(.+?);/)[1]) 
      let result=  {"jdUserName":UserName,"jdcookie":cookie1,'date':new Date().getTime()};
      $.setjson(result,`@jdcookie.${uname}`) 
      resolve(cookie1)
    })
  }
  


  function TotalBean(cookie,$) { 
    return new Promise(async resolve => {
      const options = {
        "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
        "headers": {
          "Accept": "application/json,text/plain, */*",
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "zh-cn",
          "Connection": "keep-alive",
          "Cookie": cookie,
          "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        }
      }
      $.post(options, (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (data) {
              data = JSON.parse(data);
              //console.log(data)
              if (data['retcode'] === 13) {
                resolve(false);
              }else{
                resolve(true);
              }              
            } else {
              console.log(`京东服务器返回空数据`)
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve();
        }
      })
    })
  }



  function taskUrl() {
    return {
      url: `https://plogin.m.jd.com/cgi-bin/mm/new_login_entrance?lang=chs&appid=300&returnurl=https://wq.jd.com/passport/LoginRedirect?state=${Date.now()}&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport`,
      headers: {
        'Connection': 'Keep-Alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-cn',
        'Referer': `https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wq.jd.com/passport/LoginRedirect?state=${Date.now()}&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
        'Host': 'plogin.m.jd.com'
      }
    }
  }
  
  function taskPostUrl(s_token) {
    return {
      url: `https://plogin.m.jd.com/cgi-bin/m/tmauthreflogurl?s_token=${s_token}&v=${Date.now()}&remember=true`,
      body: `lang=chs&appid=300&source=wq_passport&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=${Date.now()}&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action`,
      headers: {
        'Connection': 'Keep-Alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-cn',
        'Referer': `https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wq.jd.com/passport/LoginRedirect?state=${Date.now()}&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
        'Host': 'plogin.m.jd.com'
      }
    }
  }


  module.exports= {
    getJdUrl,
    getCookie
  }