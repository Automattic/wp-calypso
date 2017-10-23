/*
 * This codemod removes instances of `react-addons-linked-state-mixin` and converts all
 * usages of `valueLink={ this.linkState( 'x' ) }` to `value` and `onChange` props.
 */

const config = require( './config' );
const prettier = require( 'prettier' );

/* eslint-disable no-console */
export default function transformer( file, api ) {
	const j = api.jscodeshift;
	const ReactUtils = require( 'react-codemod/transforms/utils/ReactUtils' )( j );
	const root = j( file.source );

	let changedSomething = false;

	// Remove CommonJS requires of LinkedStateMixin
	const commonJSImports = root.find( j.VariableDeclarator, {
		id: { name: 'LinkedStateMixin' },
		init: {
			type: 'CallExpression',
			callee: { name: 'require' },
			arguments: [ { type: 'Literal', value: 'react-addons-linked-state-mixin' } ]
		}
	} );

	if ( commonJSImports.size() > 0 ) {
		commonJSImports.remove();
		changedSomething = true;
	}

	// Remove ES6 imports of LinkedStateMixin
	const es6Imports = root.find( j.ImportDeclaration, {
		specifiers: [ {
			type: 'ImportDefaultSpecifier',
			local: { name: 'LinkedStateMixin' }
		} ],
		source: { type: 'Literal', value: 'react-addons-linked-state-mixin' }
	} );

	if ( es6Imports.size() > 0 ) {
		es6Imports.remove();
		changedSomething = true;
	}

	ReactUtils.findAllReactCreateClassCalls( root ).forEach( transformReactClass );
	root.find( j.CallExpression, {
		callee: {
			type: 'Identifier',
			name: 'createReactClass'
		}
	} ).forEach( transformReactClass );

	if ( ! changedSomething ) {
		return null;
	}

	return prettier.format( root.toSource( config.recastOptions ), {} );

	function transformReactClass( createClassCall ) {
		removeLinkedStateMixin( createClassCall );
		const changeMethodsToAdd = transformLinkStateCalls( createClassCall );
		addChangeMethods( createClassCall, changeMethodsToAdd );
	}

	// If a React component has property "mixins: [ LinkedStateMixin ]", remove it
	function removeLinkedStateMixin( classPath ) {
		const mixinProperties = j( classPath ).find( j.Property, { key: { name: 'mixins' } } );
		if ( mixinProperties.size() === 0 ) {
			return null;
		}

		const mixinElements = j( mixinProperties.get( 'value' ).get( 'elements' ) );
		const linkedStateMixins = mixinElements.find( j.Identifier, { name: 'LinkedStateMixin' } );
		if ( linkedStateMixins.size() > 0 ) {
			// If it's the only remaining mixin, remove the whole 'mixin' property
			if ( mixinElements.get().value.length === 1 ) {
				mixinProperties.remove();
			} else {
				linkedStateMixins.remove();
			}
			changedSomething = true;
		}
	}

	// Check if a JSX element has a 'name' attribute with an expected value. It's added
	// when it's missing, or the value is changed if it's not the right one.
	function fixNameAttribute( jsxNode, statePropName ) {
		const nameAttr = jsxNode.attributes.find( a => a.name.name === 'name' );
		if ( ! nameAttr ) {
			// JSX element doesn't have a `name` attribute -- let's add it
			jsxNode.attributes.push( j.jsxAttribute(
				j.jsxIdentifier( 'name' ),
				j.literal( statePropName )
			) );
			changedSomething = true;
			return;
		}

		const name = nameAttr.value.value;
		if ( name !== statePropName ) {
			// JSX element has a `name` attribute with wrong value -- let's change it
			nameAttr.value.value = statePropName;
			changedSomething = true;
		}
	}

	// Return the right property and handler names for `valueLink` and `checkedLink`
	function linkPropInfo( linkPropName ) {
		return linkPropName === 'valueLink'
			? { valuePropName: 'value', changeHandlerName: 'handleChange' }
			: { valuePropName: 'checked', changeHandlerName: 'handleCheckedChange' };
	}

	// Transform calls to `linkState` into `value` and `onChange` props
	function transformLinkStateCalls( classPath ) {
		const changeMethodsToAdd = new Set;

		// Find all usages of 'this.linkState'
		j( classPath ).find( j.MemberExpression, {
			object: { type: 'ThisExpression' },
			property: { type: 'Identifier', name: 'linkState' }
		} ).forEach( ( linkStateCall ) => {
			// Verify they are all function calls with one string arg: this.linkState( 'x' )
			// We can't transform any other occurences.
			const caller = linkStateCall.parentPath.value;
			if ( ! j.match( caller, { type: 'CallExpression', arguments: [ { type: 'Literal' } ] } ) ) {
				console.log( 'ERR: Not a method call with one arg!' );
				return;
			}

			// Save the name of the state property that's the target of the link
			const stateProp = caller.arguments[ 0 ].value;

			// Is the 'this.linkState' call inside a JSX attribute?
			// We can't transform it if it isn't.
			const linkProps = j( linkStateCall ).closest( j.JSXAttribute );
			if ( linkProps.size() === 0 ) {
				console.log( 'ERR: Not a child of JSX attribute!' );
				return;
			}

			const linkProp = linkProps.get();
			const linkPropName = linkProp.value.name.name;
			if ( ! [ 'valueLink', 'checkedLink' ].includes( linkPropName ) ) {
				console.log( 'ERR: The JSX attribute is neither valueLink nor checkedLink!' );
				return;
			}

			const openingEl = j( linkProp ).closest( j.JSXOpeningElement ).get();
			fixNameAttribute( openingEl.value, stateProp );

			changeMethodsToAdd.add( linkPropName );

			const { valuePropName, changeHandlerName } = linkPropInfo( linkPropName );

			openingEl.value.attributes.push( j.jsxAttribute(
				j.jsxIdentifier( valuePropName ),
				j.jsxExpressionContainer( j.template.expression`this.state.${ stateProp }` )
			) );

			openingEl.value.attributes.push( j.jsxAttribute(
				j.jsxIdentifier( 'onChange' ),
				j.jsxExpressionContainer( j.template.expression`this.${ changeHandlerName }` )
			) );

			linkProps.remove();
			changedSomething = true;
		} );

		return changeMethodsToAdd;
	}

	// Add change handler methods (i.e., `handleChange`) to the class
	function addChangeMethods( classPath, changeMethodsToAdd ) {
		const objectExpr = classPath.value.arguments[ 0 ];

		for ( const linkPropName of changeMethodsToAdd ) {
			const { valuePropName, changeHandlerName } = linkPropInfo( linkPropName );
			const property = j.property(
				'init',
				j.identifier( changeHandlerName ),
				j.functionExpression(
					null,
					[ j.identifier( 'e' ) ],
					j.blockStatement( [
						j.template.statement`const { name, ${ valuePropName } } = e.currentTarget;\n`,
						j.template.statement`this.setState( { [ name ]: ${ valuePropName } } );`,
					] )
				)
			);
			property.method = true;
			objectExpr.properties.push( property );
		}
	}
}
