/** @format */
/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { compose, createHigherOrderComponent } from '@wordpress/compose';
import { get } from 'lodash';
import { Placeholder } from '@wordpress/components';

/**
 * Internal dependencies
 */
import withJetpackData from 'gutenberg/extensions/jetpack/with-jetpack-data';

/** @TODO Get a designer and copy writer for goodness sake */

/**
 * Add modules to Component props
 *
 * This is _not_ connect. This is a temporary solution until robust module data is exposed
 * in the components.
 *
 * @param  {Array<String>} moduleSlugs Array of module slugs
 * @return {Function}                  Function to wrap Component adding jetpackModules prop
 */
export default function requireConnection( { blockName, allowDevMode = false } = {} ) {
	return compose(
		withJetpackData( [ 'connectionStatus' ] ),
		createHigherOrderComponent( WrappedComponent => {
			return class extends Component {
				render() {
					const { jetpackData, ...props } = this.props;

					/**
					 * At time of writing, WP Admin connectionStatus looks like this:
					 * {
					 *   "isActive": true,
					 *   "isStaging": false,
					 *   "devMode": {
					 *     "isActive": false,
					 *     "constant": false,
					 *     "url": false,
					 *     "filter": false
					 *   },
					 *   "isPublic": true,
					 *   "isInIdentityCrisis": false
					 * }
					 */

					const isConnected = get( jetpackData, [ 'isActive' ], false );

					if ( isConnected ) {
						return <WrappedComponent { ...props } />;
					}

					if ( allowDevMode && get( jetpackData, [ 'devMode', 'isActive' ], false ) ) {
						return (
							<div
								style={ {
									outline: '1px dotted #bada55',
								} }
							>
								<p
									style={ {
										fontStyle: 'italic',
										backgroundColor: '#bada55',
									} }
								>
									{ /* @TODO localize and copy */ }
									You can use this in <b>Dev Mode</b>, but you should really set up Jetpack.
								</p>
								<WrappedComponent { ...props } JetpackDevMode />
							</div>
						);
					}

					return (
						<Placeholder>
							{ /* @TODO localize and copy */ }
							{ blockName
								? `Set up Jeptack in order to use ${ blockName }.`
								: 'Set up Jetpack to use this block.' }
						</Placeholder>
					);
				}
			};
		}, 'requireConnection' )
	);
}
