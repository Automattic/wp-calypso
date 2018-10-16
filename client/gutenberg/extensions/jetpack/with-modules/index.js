/** @format */
/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { compose, createHigherOrderComponent } from '@wordpress/compose';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import withJetpackData from 'gutenberg/extensions/jetpack/with-jetpack-data';

/**
 * Add modules to Component props
 *
 * This is _not_ connect. This is a temporary solution until robust module data is exposed
 * in the components.
 *
 * @param  {Array<String>} moduleSlugs Array of module slugs
 * @return {Function}                  Function to wrap Component adding jetpackModules prop
 */
export default function withModules( moduleSlugs ) {
	return compose(
		withJetpackData( [ 'getModules' ] ),
		createHigherOrderComponent( WrappedComponent => {
			return class extends Component {
				render() {
					const { jetpackData, ...props } = this.props;
					return (
						<WrappedComponent { ...props } jetpackModules={ pick( jetpackData, moduleSlugs ) } />
					);
				}
			};
		}, 'withModules' )
	);
}
