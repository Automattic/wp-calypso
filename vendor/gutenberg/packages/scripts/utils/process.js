const getCliArgs = () => process.argv.slice( 2 );

module.exports = {
	exit: process.exit,
	getCliArgs,
	getCurrentWorkingDirectory: process.cwd,
};
