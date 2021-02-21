const Env=require('./Env.min.js')
const $ = new Env('扫码获取京东cookie');
let s_token, cookies, guid, lsid, lstoken, okl_token, token

module.exports= async function getJdCookie(uname) {
    $.uname=uname
    var data=$.getjson(`@jdcookie.${uname}`,{})  
    var qrcode=data.jdcookie;
    if(qrcode){
      await TotalBean(qrcode);
    }
    //console.log(uname,!$.isLogin, !qrcode)
    if(!$.isLogin || !qrcode){
        await loginEntrance();
        qrcode= await generateQrcode();        
       // console.log("qrcode",qrcode)
        if($.timer){
            clearInterval($.timer);
        }
        getCookie()
        return qrcode
    }
    return `${qrcode}获取日期：${$.time('yyyy-MM-dd qq HH:mm:ss',data.date)}`;
}

function loginEntrance() {
    return new Promise((resolve) => {
      $.get(taskUrl(), async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`);
          } else {
            $.headers = resp.headers;
            $.data = JSON.parse(data);
            await formatSetCookies($.headers, $.data);
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve();
        }
      })
    })
  }


  function generateQrcode() {
    var url='';
    return new Promise((resolve) => {
      $.post(taskPostUrl(), (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`);
          } else {
            $.stepsHeaders = resp.headers;
            data = JSON.parse(data);
            token = data['token'];
            // $.log('token', token)
  
            const setCookie = resp.headers['set-cookie'][0];
            okl_token = setCookie.substring(setCookie.indexOf("=") + 1, setCookie.indexOf(";"))
            url = 'https://plogin.m.jd.com/cgi-bin/m/tmauth?appid=300&client_type=m&token=' + token;
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(url);
        }
      })
    })
  }


function getCookie() {
    setTimeout(() => {
      $.timer = setInterval(async () => {
        const checkRes = await checkLogin();
        if (checkRes['errcode'] === 0) {
          //扫描登录成功
          $.log(`扫描登录成功\n`)
          clearInterval($.timer);
          await formatCookie($.checkLoginHeaders);  
         // console.log($.uname,cookie)
          $.done();
        } else if (checkRes['errcode'] === 21) {
          $.log(`二维码已失效，请重新获取二维码重新扫描\n`);
          clearInterval($.timer);
          $.done();
        } else if (checkRes['errcode'] === 176) {
          //未扫描登录
        } else {
          $.log(`其他异常：${JSON.stringify(checkRes)}\n`);
          clearInterval($.timer);
          $.done();
        }
      }, 10000) 
    }, 10*1000);
    
 
  }


  function checkLogin() {
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
            console.log(`${$.name} API请求失败，请检查网路重试`);
          } else {
            data = JSON.parse(data);
            $.checkLoginHeaders = resp.headers;
            // $.log(`errcode:${data['errcode']}`)
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve(data);
        }
      })
    })
  }
  
function formatCookie(headers) {
    new Promise(resolve => {
      let pt_key = headers['set-cookie'][1]
      pt_key = pt_key.substring(pt_key.indexOf("=") + 1, pt_key.indexOf(";"))
      let pt_pin = headers['set-cookie'][2]
      pt_pin = pt_pin.substring(pt_pin.indexOf("=") + 1, pt_pin.indexOf(";"))
      const cookie1 = "pt_key=" + pt_key + ";pt_pin=" + pt_pin + ";";  
      $.UserName = decodeURIComponent(cookie1.match(/pt_pin=(.+?);/) && cookie1.match(/pt_pin=(.+?);/)[1]) 
      var result=  {"jdUserName":$.UserName,"jdcookie":cookie1,'date':new Date().getTime()};
      $.setjson(result,`@jdcookie.${$.uname}`) 
      resolve(result)
    })
  }
  
  function formatSetCookies(headers, body) {
    new Promise(resolve => {
      s_token = body['s_token']
      guid = headers['set-cookie'][0]
      guid = guid.substring(guid.indexOf("=") + 1, guid.indexOf(";"))
      lsid = headers['set-cookie'][2]
      lsid = lsid.substring(lsid.indexOf("=") + 1, lsid.indexOf(";"))
      lstoken = headers['set-cookie'][3]
      lstoken = lstoken.substring(lstoken.indexOf("=") + 1, lstoken.indexOf(";"))
      cookies = "guid=" + guid + "; lang=chs; lsid=" + lsid + "; lstoken=" + lstoken + "; "
      resolve()
    })
  }


  function TotalBean(cookie) {
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
              console.log(data)
              if (data['retcode'] === 13) {
                $.isLogin = false; //cookie过期
                return
              }else{
                $.isLogin = true;
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
  
  function taskPostUrl() {
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