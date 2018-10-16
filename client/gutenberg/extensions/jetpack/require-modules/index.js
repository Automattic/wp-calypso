/** @format */
/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { createHigherOrderComponent, compose } from '@wordpress/compose';
import { map, pickBy, size } from 'lodash';
import { Placeholder } from '@wordpress/components';

/**
 * Internal dependencies
 */
import withModules from 'gutenberg/extensions/jetpack/with-modules';

/**
 * @typedef ModuleSpec
 *
 * Looks like this:
 *   [ 'moduleSlug, {
 *     allowDev: true,
 *     // …possibly more options
 *   } ]
 *
 * Optional shorthand to just require an active module:
 *   'moduleSlug' (defaults to required, not allowed in dev mode)
 */

/**
 * @param  {Array<ModuleSpec>} moduleSpecs Required modules
 * @return {Function}                      Higher Order Component requiring Jetpack modules
 */
export default function requireModules( moduleSpecs ) {
	return compose(
		withModules( moduleSpecs.map( spec => ( Array.isArray( spec ) ? spec[ 0 ] : spec ) ) ),
		createHigherOrderComponent( WrappedComponent => {
			return class extends Component {
				render() {
					const { jetpackModules, ...props } = this.props;

					const missingModuleActivations = pickBy( jetpackModules, module => {
						return ! module.activated || module.override === 'inactive';
					} );

					if ( size( missingModuleActivations ) ) {
						return map( missingModuleActivations, ( { name } ) => (
							<Placeholder>Required "{ name }" module must be activated 😢</Placeholder>
						) );
					}

					return <WrappedComponent { ...props } />;
				}
			};
		}, 'requireModules' )
	);
}
