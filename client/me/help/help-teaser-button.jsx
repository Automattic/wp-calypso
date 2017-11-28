/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';

export default localize( ( { title, description, href, onClick } ) => {
	return (
		<div className="help__help-teaser-button">
			<Card href={ href } onClick={ onClick }>
				<Gridicon className="help__help-teaser-button-icon" icon="help" size={ 36 } />
				<div className="help__help-teaser-text">
					<span className="help__help-teaser-button-title">{ title }</span>
					<span className="help__help-teaser-button-description">{ description }</span>
				</div>
			</Card>
		</div>
	);
} );
