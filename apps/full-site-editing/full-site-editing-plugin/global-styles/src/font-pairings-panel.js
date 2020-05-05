/**
 * External dependencies
 */
import { ENTER } from '@wordpress/keycodes';
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import NoSupport from './no-support';
import loadFontPairingPreview from './font-pairings-panel-previews';

export default ( { fontPairings, fontBase, fontHeadings, update } ) => {
	return (
		<>
			<h3>{ __( 'Font Pairings' ) }</h3>
			{ fontPairings && fontHeadings && fontBase ? (
				<div role="listbox">
					{ fontPairings.map( ( { label, headings, base, preview } ) => {
						const isSelected = headings === fontHeadings && base === fontBase;
						const classes = classnames( 'font-pairings-panel', {
							'is-selected': isSelected,
						} );
						return (
							<div
								key={ label }
								tabIndex={ 0 }
								role="option"
								aria-selected={ isSelected }
								className={ classes }
								onClick={ () => update( { headings, base } ) }
								onKeyDown={ ( event ) =>
									event.keyCode === ENTER ? update( { headings, base } ) : null
								}
							>
								<div className="font-pairings-panel__preview">
									{ loadFontPairingPreview( preview, headings, base ) }
								</div>
								<p className="font-pairings-panel__label">{ label }</p>
							</div>
						);
					} ) }
				</div>
			) : (
				<NoSupport unsupportedFeature={ __( 'font pairings' ) } />
			) }
		</>
	);
};
