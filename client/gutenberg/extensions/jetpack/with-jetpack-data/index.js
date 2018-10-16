/** @format */
/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { createHigherOrderComponent } from '@wordpress/compose';
import { get, isNull } from 'lodash';

/**
 * Where Jetpack data can be found in WP Admin
 */
const JETPACK_DATA_PATH = [ 'Jetpack_Initial_State' ];

/**
 * Add modules to Component props
 *
 * This is _not_ connect. This is a temporary solution until robust module data is exposed
 * in the components.
 *
 * @param  {Array<String>} moduleSlugs Array of module slugs
 * @return {Function}                  Function to wrap Component adding jetpackModules prop
 */
export default function withJetpackData( ...args ) {
	if ( 'function' !== typeof withJetpackData.getJetpackData ) {
		const maybeJetpackData = get(
			'object' === typeof window ? window : null,
			JETPACK_DATA_PATH,
			null
		);
		withJetpackData.getJetpackData = isNull( maybeJetpackData )
			? ( path, defaultValue ) => defaultValue
			: ( path, defaultValue ) => get( maybeJetpackData, path, defaultValue );
	}

	return createHigherOrderComponent( WrappedComponent => {
		const { getJetpackData } = withJetpackData;
		const jetpackData = getJetpackData( ...args );
		return class extends Component {
			render() {
				return <WrappedComponent { ...this.props } jetpackData={ jetpackData } />;
			}
		};
	}, 'withJetpackData' );
}
