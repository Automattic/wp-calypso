const lodashAmdCondition =
	"typeof define == 'function' && typeof define.amd == 'object' && define.amd";

module.exports = function disableLodashAmdLoader( source ) {
	const result = source.replace( lodashAmdCondition, 'false' );

	if ( result === source ) {
		throw new Error(
			'Expected to disable lodash AMD detection, but no matching branch was found.'
		);
	}

	return result;
};
