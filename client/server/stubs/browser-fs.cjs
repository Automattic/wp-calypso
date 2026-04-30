module.exports = {
	existsSync: () => false,
	readFileSync: () => {
		throw new Error( 'fs.readFileSync is not available in the browser.' );
	},
};
