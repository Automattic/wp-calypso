/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Icon, blockDefault } from '@wordpress/icons';
import { addAction } from '@wordpress/hooks';
import { unregisterPlugin, registerPlugin } from '@wordpress/plugins';
import { __experimentalInserterMenuExtension } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { isSimpleSite } from '../utils';
import './style.scss';

if ( isSimpleSite ) {
	addAction(
		'plugins.pluginRegistered',
		'full-site-editing/disable-block-registry',
		( settings, name ) => {
			if ( name === 'block-directory' ) {
				unregisterPlugin( name );
			}
		}
	);

	// Check if the experimental slot is available before registering the plugin.
	if ( typeof __experimentalInserterMenuExtension !== 'undefined' ) {
		registerPlugin( 'disable-block-registry', {
			render: () => (
				<__experimentalInserterMenuExtension>
					{ ( { hasResults } ) => {
						if ( ! hasResults ) {
							// We need to define our own 'no results' until we enable Block Directory.
							return (
								<div className="disable-block-directory__no-results">
									<Icon icon={ blockDefault } />
									{ /* translators: Displayed when block search returns no results. */ }
									<p>{ __( 'No results found.', 'full-site-editing' ) }</p>
								</div>
							);
						}
						return null;
					} }
				</__experimentalInserterMenuExtension>
			),
		} );
	}
}
