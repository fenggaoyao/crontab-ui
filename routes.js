exports.routes = {
	"root" : "/",
	"save" : "/save",
	"run" : "/runjob",
	"crontab" : "/crontab",
	"stop" : "/stop",
	"start" : "/start",
	"remove": "/remove",
	"backup": "/backup",
	"restore": "/restore",
	"delete_backup": "/delete",
	"restore_backup": "/restore_backup",
	"export": "/export",
	"import": "/import", // this is import from database
	"import_crontab": "/import_crontab", // this is from existing crontab
	"logger": "/logger",
	"stdout": "/stdout",
	"gitSync":"/gitSync",
	"file":"/file",
	"command":"/command",	
	"project":"/project",

	"files":"/files",
	"crontabs" : "/crontabs",
	"savecookie":"/savecookie",
	"jdcookies":"/jdcookies",
	"getJdCookie":"/getJdCookie",
	"qrcode":"/qrcode",
	"setdata":"/setdata",
	"getdata":"/getdata",
	"wxmsg":"/wxmsg"


};
exports.relative = Object.keys(exports.routes).reduce((p, c) => ({...p, [c]: exports.routes[c].replace(/^\//, '')}), {});
exports.relative["root"] = ".";