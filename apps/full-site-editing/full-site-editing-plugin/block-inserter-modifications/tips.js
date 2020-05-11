/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __experimentalInserterMenuExtension as InserterMenuExtension } from '@wordpress/block-editor';
import { registerPlugin } from '@wordpress/plugins';
import { Tip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/* eslint-enable import/no-extraneous-dependencies */

const EnrichInserterMenu = function () {
	const [ debouncedFilterValue, setFilterValue ] = useState( '' );

	const debouncedSetFilterValue = debounce( setFilterValue, 400 );

	return (
		<InserterMenuExtension>
			{ ( { filterValue, hasItems } ) => {
				if ( hasItems || ! filterValue ) {
					return null;
				}

				if ( debouncedFilterValue !== filterValue ) {
					debouncedSetFilterValue( filterValue );
				}

				let searchingResults = null;
				switch ( filterValue ) {
					case 'css':
						searchingResults = (
							<Tip>
								You can visit the{ ' ' }
								<a href="/customize.php?autofocus[section]=custom_css" target="_blank">
									the Customizer
								</a>{ ' ' }
								to edit the CSS on your site.
							</Tip>
						);
						break;
					case 'theme':
						searchingResults = (
							<Tip>
								You can visit the{ ' ' }
								<a href="/themes.php" target="_blank">
									theme directory
								</a>{ ' ' }
								to select a different design for your site.
							</Tip>
						);
						break;
					case 'plugin':
						searchingResults = (
							<Tip>
								You can visit the{ ' ' }
								<a href="/plugin-install.php" target="_blank">
									plugin directory
								</a>{ ' ' }
								to install additional plugins.
							</Tip>
						);
						break;
					case 'header':
						searchingResults = (
							<Tip>
								You can visit the{ ' ' }
								<a href="/customize.php?autofocus[section]=title_tagline" target="_blank">
									the Customizer
								</a>{ ' ' }
								to edit your logo and site title.
							</Tip>
						);
						break;
					case 'colors':
						searchingResults = (
							<Tip>
								You can visit the{ ' ' }
								<a href="/customize.php?autofocus[section]=colors" target="_blank">
									the Customizer
								</a>{ ' ' }
								to edit your logo and site title.
							</Tip>
						);
						break;
					default:
						searchingResults = (
							/* eslint-disable wpcalypso/jsx-classname-namespace */
							<p className="block-editor-inserter__no-results">{ __( 'No blocks found.' ) }</p>
						);
					/* eslint-enable wpcalypso/jsx-classname-namespace */
				}

				return searchingResults;
			} }
		</InserterMenuExtension>
	);
};

registerPlugin( 'enrich-inserter-menu', {
	render() {
		return <EnrichInserterMenu />;
	},
} );
