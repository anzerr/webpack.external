
module.exports = {
	SCOPED_MODULE_REGEX: new RegExp('@[a-zA-Z0-9][\\w-.]+\/[a-zA-Z0-9][\\w-.]+([a-zA-Z0-9.\/]+)?', 'g'),
	PREFIX: new RegExp('^@', 'g')
};
