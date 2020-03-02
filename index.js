
const util = require('./src/util'),
	is = require('type.util'),
	path = require('path'),
	{SCOPED_MODULE_REGEX} = require('./src/enum');

class NodeExternals {

	constructor(options = {}) {
		this.config = {
			whitelist: [].concat(options.whitelist || []),
			binaryDirs: [].concat(options.binaryDirs || ['.bin']),
			importType: options.importType || 'commonjs',
			modulesDir: options.modulesDir || 'node_modules',
			modulesFromFile: Boolean(options.modulesFromFile),
			modulesRecursive: Boolean(options.modulesRecursive),
			includeAbsolutePaths: Boolean(options.includeAbsolutePaths),
		};
		this.modules = null;
	}

	isNotBinary(x) {
		return !util.contains(this.config.binaryDirs, x);
	}

	load() {
		if (this.modules) {
			return Promise.resolve(this.modules);
		}
		return Promise.resolve().then(() => {
			if (this.config.modulesFromFile) {
				return util.readPackage(this.config.modulesFromFile);
			}
			if (this.config.modulesRecursive) {
				let cwd = process.cwd(), out = {};
				const wait = [], count = (cwd.match(/[\\|\/]/g) || []).length;
				for (let i = 0; i < count; i++) {
					wait.push(util.readModules(path.join(cwd, 'node_modules')).then((res) => {
						for (let i in res) {
							out[res[i]] = true;
						}
					}));
					cwd = path.join(cwd, '..');
				}
				return Promise.all(wait).then(() => {
					return Object.keys(out).filter((x) => this.isNotBinary(x));
				});
			}
			return util.readModules(this.config.modulesDir).then((res) => {
				return res.filter((x) => this.isNotBinary(x));
			});
		}).then((res) => {
			return (this.modules = res);
		});
	}

	getModuleName(request, includeAbsolutePaths) {
		let req = request;
		let delimiter = '/';

		if (includeAbsolutePaths) {
			req = req.replace(/^.*?\/node_modules\//, '');
		}
		if (req.match(SCOPED_MODULE_REGEX)) {
			return req.split(delimiter, 2).join(delimiter);
		}
		return req.split(delimiter)[0];
	}

	call(context, request) {
		return this.load().then((nodeModules) => {
			let moduleName = this.getModuleName(request, this.config.includeAbsolutePaths);
			if (util.contains(nodeModules, moduleName) && !util.containsPattern(this.config.whitelist, request)) {
				if (is.function(this.config.importType)) {
					return this.config.importType(request);
				}
				return `${this.config.importType} ${request}`;
			}
		});
	}

}

module.exports = (options) => {
	const n = new NodeExternals(options);
	return (context, request, callback) => {
		return n.call(context, request, callback).then((res) => {
			callback(null, res);
		}).catch((err) => {
			callback(err);
		});
	};
};
