/** @format */
/*
 This codemod updates

 export default someHoC( React.createClass( {
	displayName: 'SomeDisplayName',
 } ) );

 to

 const SomeDisplayName = React.createClass({
   displayName: 'SomeDisplayName',
 });

 export default someHoC( SomeDisplayName );

 and

 export default someHoC( class extends {Component|PureComponent|React.Component} {
	static displayName = 'SomeDisplayName';
 } );

 to

 class SomeDisplayName extends {Component|PureComponent|React.Component} {
	static displayName = 'SomeDisplayName';
 };

 export default someHoC( SomeDisplayName );
 */

const createClassIdentifier = {
	type: 'CallExpression',
	callee: {
		type: 'MemberExpression',
		object: {
			name: 'React',
		},
		property: {
			name: 'createClass',
		},
	},
};

const displayNamePropertyIdentifier = {
	key: {
		name: 'displayName',
	},
};

const isValidComponentString = string => string === 'Component' || string === 'PureComponent';

const argIsCreateClassInstance = arg =>
	arg.get( 'callee', 'object', 'name' ).value === 'React' &&
	arg.get( 'callee', 'property', 'name' ).value === 'createClass';

const argIsExtendsComponentInstance = arg =>
	arg.get( 'type' ).value === 'ClassExpression' &&
	( isValidComponentString( arg.get( 'superClass', 'name' ).value ) ||
		( arg.get( 'superClass', 'object', 'name' ).value === 'React' &&
			isValidComponentString( arg.get( 'superClass', 'property', 'name' ).value ) ) );

const argIsComponent = arg =>
	argIsCreateClassInstance( arg ) || argIsExtendsComponentInstance( arg );

const getMatchingArg = args => args.filter( argIsComponent )[ 0 ];

export default function transformer( file, api ) {
	const j = api.jscodeshift;
	const root = j( file.source );

	// string => object =>
	const replaceClassOrGetValue = displayName => arg =>
		argIsComponent( arg ) ? j.identifier( displayName ) : arg.value;

	const exportDefaultDeclarations = root.find( j.ExportDefaultDeclaration );

	exportDefaultDeclarations.forEach( node => {
		const calleeNameValue = node.get( 'declaration', 'callee', 'name' ).value;

		if ( ! calleeNameValue ) {
			// return early, no immediate function call
			return;
		}

		const exportDefaultInstance = j( node );

		const args = node.get( 'declaration', 'arguments' );
		const matchingArg = getMatchingArg( args );

		if ( ! matchingArg ) {
			// return early, no createClass or extends Component argument found
			return;
		}

		const isCreateClassInstance = argIsCreateClassInstance( matchingArg );

		const propertyType = isCreateClassInstance ? j.Property : j.ClassProperty;

		const classExpressions = isCreateClassInstance
			? exportDefaultInstance.find( j.CallExpression, createClassIdentifier )
			: exportDefaultInstance.find( j.ClassExpression );

		const displayNameValue = classExpressions
			.find( propertyType, displayNamePropertyIdentifier )
			.at( 0 )
			.get( 'value', 'value' ).value;

		if ( ! displayNameValue ) {
			// return early, no displayNameValue
			return;
		}

		exportDefaultInstance.replaceWith( node => [
			isCreateClassInstance
				? // if createClass, replace with const x = React.createClass...
					j.variableDeclaration( 'const', [
						j.variableDeclarator( j.identifier( displayNameValue ), matchingArg.value ),
					] )
				: // else Replace with class x extends {original-super-class}...
					j.classDeclaration(
						j.identifier( displayNameValue ),
						matchingArg.value.body,
						matchingArg.value.superClass
					),
			// In both cases export with export default calleeName( x ),
			// maintaining argument position
			j.exportDefaultDeclaration(
				j.callExpression(
					j.identifier( calleeNameValue ),
					args.map( replaceClassOrGetValue( displayNameValue ) )
				)
			),
		] );
	} );

	return exportDefaultDeclarations.toSource( {
		useTabs: true,
	} );
}
