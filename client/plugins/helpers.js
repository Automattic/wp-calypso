/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import SidebarItem from 'layout/sidebar/item';

const debug = debugFactory( 'calypso:plugins' );

const notify = debug;
const error = console.error.bind( console );
const decorated = {};

// TODO: replace fixture w/ data from 'external-plugins'
const modules = [
	{
		_pluginName: 'Hello, Dolly',
		SitesSidebarMenu( Base, { React, notify } ) { // eslint-disable-line no-shadow
			notify( 'decorating SitesSidebarMenu' );
			return class extends React.Component {
				render() {
					const props = {
						...this.props,
						extraChildren: (
							<SidebarItem
								icon="status"
								label="Hello, World!"
								link="/hello-world" />
						),
					};

					return <Base { ...props } />;
				}
			};
		},
	},
].map( module => {
	const decorators = omit( module, '_pluginName' );
	Object.keys( decorators ).forEach( key => {
		decorators[ key ]._pluginName = module._pluginName;
	} );
	return decorators;
} );

function getDecorated( parent, name ) {
	if ( ! decorated[ name ] ) {
		let class_ = parent;

		modules.forEach( ( module ) => {
			const fn = module[ name ];

			if ( fn ) {
				let class__;

				try {
					class__ = fn( class_, { React, notify } );
				} catch ( err ) {
					error( err.stack );
					notify( 'Plugin error', `${ fn._pluginName }: Error occurred in \`${ name }\`. Check Developer Tools for details` );
					return;
				}

				if ( ! class__ || 'function' !== typeof class__.prototype.render ) {
					notify( 'Plugin error', `${ fn._pluginName }: Invalid return value of \`${ name }\`. No \`render\` method found. Please return a \`React.Component\`.` );
					return;
				}

				class_ = class__;
			}
		} );

		decorated[ name ] = class_;
	}

	return decorated[ name ];
}

// for each component, we return a higher-order component
// that wraps with the higher-order components
// exposed by plugins
export function decorate( Component, name ) {
	class Decorated extends React.Component {
		render() {
			const Sub = getDecorated( Component, name );
			return <Sub { ...this.props } />;
		}
	}
	Decorated.displayName = `Decorated${ name }`;
	return Decorated;
}

