/** @format */

// Press ctrl+space for code completion
export default function transformer( file, api ) {
	const j = api.jscodeshift;

	return j( file.source )
		.find( j.CallExpression )
		.filter( p => p.node.callee.property && p.node.callee.property.name === 'submitSignupStep' )
		.filter( p => p.node.arguments.length > 1 )
		.forEach(
			p =>
				( p.node.arguments = p.node.arguments.slice( 0, 1 ).concat( p.node.arguments.slice( 2 ) ) )
		)
		.toSource();
}
