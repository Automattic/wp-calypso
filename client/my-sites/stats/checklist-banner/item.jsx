/** @format */

/**
 * External dependencies
 */
import React from 'react';

export default ( { completed, description, title } ) => {
	if ( completed ) {
		return null;
	}

	// TODO: Add logic to return null if one of these has already been rendered

	return (
		<div className="checklist-banner__content">
			<h3 className="checklist-banner__title">{ title }</h3>
			<p className="checklist-banner__description">{ description }</p>
		</div>
	);
};
