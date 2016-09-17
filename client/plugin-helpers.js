/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import { noop } from 'lodash';

const debug = debugFactory( 'calypso:plugins' );

// TODO: replace fixture w/ data from 'external-plugins'
const modules = [
	{
		SitesSidebarMenu( Base, { React, notify } ) { // eslint-disable-line no-shadow
			notify( 'omgomg, rendering a decorated SitesSidebarMenu!' );
			return <Base { ...this.props } />;
		},
	},
];

/**
 * FIXME
 */
const notify = debug;
const decorated = noop;

function getDecorated( parent, name ) {
	if ( ! decorated[ name ] ) {
		let class_ = parent;

		modules.forEach( ( mod ) => {
			const method = 'decorate' + name;
			const fn = mod[ method ];

			if ( fn ) {
				let class__;

				try {
					class__ = fn( class_, { React, notify } );
				} catch ( err ) {
					console.error( err.stack );
					notify( 'Plugin error', `${ fn._pluginName }: Error occurred in \`${ method }\`. Check Developer Tools for details` );
					return;
				}

				if ( ! class__ || 'function' !== typeof class__.prototype.render ) {
					notify( 'Plugin error', `${ fn._pluginName }: Invalid return value of \`${ method }\`. No \`render\` method found. Please return a \`React.Component\`.` );
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
	return class extends React.Component {
		render() {
			const Sub = getDecorated( Component, name );
			return <Sub { ...this.props } />;
		}
	};
}

