const fs = require('fs.promisify'),
	path = require('path'),
	is = require('type.util'),
	{PREFIX} = require('./enum');

class Util {

	readDir(dir, prefix = '') {
		return fs.access(dir).then(async () => {
			let res = await fs.stat(dir);
			if (res.isDirectory()) {
				return fs.readdir(dir);
			}
			return [];
		}).catch(() => {
			return [];
		}).then((res) => {
			if (prefix) {
				for (const i in res) {
					res[i] = `${prefix}/${res[i]}`;
				}
				return res;
			}
			return res;
		});
	}

	readModules(dir) {
		let out = [];
		return this.readDir(dir).then((res) => {
			const wait = [];
			for (let i in res) {
				if (res[i].match(PREFIX)) {
					wait.push(this.readDir(path.join(dir, res[i]), res[i]).then((r) => {
						out = out.concat(r);
					}));
				} else {
					out.push(res[i]);
				}
			}
			return Promise.all(wait);
		}).then(() => out);
	}

	readPackage(options = {}) {
		return fs.readFile(path.join(process.cwd(), options.fileName || 'package.json')).then((res) => {
			return JSON.parse(res.toString());
		}).then((json) => {
			const section = {dependencies: true, devDependencies: true, peerDependencies: true, optionalDependencies: true};
			if (is.array(options.include)) {
				for (let i in options.include) {
					section[i] = true;
				}
			}
			if (is.array(options.exclude)) {
				for (let i in options.exclude) {
					section[i] = false;
				}
			}
			return {
				json: json,
				section: Object.keys(section).filter((k) => section[k])
			};
		}).then(({json, section}) => {
			let deps = {};
			for (let i in section) {
				if (is.object(json[section[i]])) {
					for (let x in json[section[i]]) {
						deps[x] = true;
					}
				}
			}
			return Object.keys(deps);
		}).catch(() => {
			return [];
		});
	}

	contains(arr, val) {
		return arr && arr.indexOf(val) !== -1;
	}

	containsPattern(arr, val) {
		return arr && arr.some((pattern) => {
			if(pattern instanceof RegExp){
				return pattern.test(val);
			} else if (typeof pattern === 'function') {
				return pattern(val);
			}
			return pattern === val;
		});
	}

}

module.exports = new Util();
