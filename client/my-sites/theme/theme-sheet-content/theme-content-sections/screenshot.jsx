/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';

const PreviewButton = localize(
	( { theme, togglePreview, translate } ) => {
		if ( ! theme.demo_uri ) {
			return null;
		}

		return (
			<a className="theme__sheet-preview-link" onClick={ togglePreview } data-tip-target="theme-sheet-preview">
				<Gridicon icon="themes" size={ 18 } />
				<span className="theme__sheet-preview-link-text">
					{ translate( 'Open Live Demo', { context: 'Individual theme live preview button' } ) }
				</span>
			</a>
		);
	}
);

const Screenshot = ( { isLoaded, isJetpack, theme, togglePreview } ) => {
	const fullLengthScreenshot = isLoaded ? theme.screenshots[ 0 ] : null;
	const screenshot = isJetpack ? theme.screenshot : fullLengthScreenshot;
	const img = screenshot && <img className="theme__sheet-img" src={ screenshot + '?=w680' } />;

	return (
		<div className="theme__sheet-screenshot">
			<PreviewButton
				togglePreview={ togglePreview }
				theme={ theme }
			/>
			{ img }
		</div>
	);
};

export default Screenshot;
