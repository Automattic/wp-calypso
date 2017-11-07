/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */

class Settings extends React.Component {

	constructor( props ) {
		super( props );
	}
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	render() {
		return (
			<div className="email-settings__container">
			</div>
		);
	}
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

Settings.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default localize( Settings );
