/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import GridiconHelp from 'gridicons/dist/help';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export default localize( ( { title, description, href, onClick } ) => {
	return (
		<div className="help__help-teaser-button">
			<Card href={ href } onClick={ onClick }>
				<GridiconHelp className="help__help-teaser-button-icon" size={ 36 } />
				<div className="help__help-teaser-text">
					<span className="help__help-teaser-button-title">{ title }</span>
					<span className="help__help-teaser-button-description">{ description }</span>
				</div>
			</Card>
		</div>
	);
} );
