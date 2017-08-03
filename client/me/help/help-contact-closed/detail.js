/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

export default localize( ( props ) => {
	const {	icon, children } = props;

	return (
		<div className="help-contact-closed__detail">
			<Gridicon className="help-contact-closed__detail-icon" icon={ icon } size={ 24 } />
			<div className="help-contact-closed__detail-text">
				{ children }
			</div>
		</div>
	);
} );
