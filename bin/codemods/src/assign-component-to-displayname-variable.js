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

import * as _ from 'lodash';

const displayNamePropertyIdentifier = {
	key: {
		name: 'displayName',
	},
};

const isValidComponentString = string => string === 'Component' || string === 'PureComponent';

const isCreateClassComponent = arg =>
	_.get( arg, [ 'callee', 'object', 'name' ] ) === 'React' &&
	_.get( arg, [ 'callee', 'property', 'name' ] ) === 'createClass';

const isEs6ClassComponent = arg =>
	_.get( arg, 'type' ) === 'ClassExpression' &&
	( isValidComponentString( _.get( arg, [ 'superClass', 'name' ] ) ) ||
		( _.get( arg, [ 'superClass', 'object', 'name' ] ) === 'React' &&
			isValidComponentString( _.get( arg, [ 'superClass', 'property', 'name' ] ) ) ) );

const isComponent = arg => isCreateClassComponent( arg ) || isEs6ClassComponent( arg );

const getComponentFromArgs = args => _.filter( args, isComponent )[ 0 ];

const classToIdentifier = ( displayName, j ) => arg =>
	isComponent( arg ) ? j.identifier( displayName ) : arg;

const extractDisplayName = ( reactComponent, j ) => {
	if ( ! reactComponent ) {
		return;
	}
	const component = j( reactComponent );
	// can work on both es6 classes and React.createClass functions.
	return []
		.concat(
			component.find( j.Property, displayNamePropertyIdentifier ).nodes(),
			component.find( j.ClassProperty, displayNamePropertyIdentifier ).nodes()
		)
		.map( node => _.get( node, 'value.value' ) )[ 0 ];
};

export default function transformer( file, api ) {
	const j = api.jscodeshift;
	const root = j( file.source );

	const defaultExportDeclaration = _.head( root.find( j.ExportDefaultDeclaration ).nodes() );
	const hocIdentifier = _.get( defaultExportDeclaration, [ 'declaration', 'callee', 'name' ] );

	const hocArgs = _.get( defaultExportDeclaration, [ 'declaration', 'arguments' ] );
	const component = getComponentFromArgs( hocArgs );
	const displayName = extractDisplayName( component, j );

	// noop if the file does not have a default export of a react component that has a displayName
	if ( ! defaultExportDeclaration || ! component || ! displayName ) {
		return;
	}

	const isCreateClass = isCreateClassComponent( component );

	return root
		.find( j.ExportDefaultDeclaration )
		.replaceWith( () => [
			isCreateClass
				? // if createClass, replace with const x = React.createClass...
					j.variableDeclaration( 'const', [
						j.variableDeclarator( j.identifier( displayName ), component ),
					] )
				: // else Replace with class x extends {original-super-class}...
					j.classDeclaration( j.identifier( displayName ), component.body, component.superClass ),
			// In both cases export with export default hoc( ...args, displayName, ...args ),
			// maintaining argument position
			j.exportDefaultDeclaration(
				j.callExpression(
					j.identifier( hocIdentifier ),
					hocArgs.map( classToIdentifier( displayName, j ) )
				)
			),
		] )
		.toSource( { useTabs: true } );
}
