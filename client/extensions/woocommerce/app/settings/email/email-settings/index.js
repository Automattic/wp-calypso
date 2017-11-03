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

	render() {
		return (
			<div className="email-settings">
			</div>
		);
	}
}

Settings.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default localize( Settings );
