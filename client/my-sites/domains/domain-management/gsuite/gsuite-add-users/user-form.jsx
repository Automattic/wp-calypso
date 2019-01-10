/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */

class UserForm extends React.Component {
	render() {
		return (
			<Fragment>
				<div className="gsuite-add-users__email-address-fieldsets">
					{ this.emailAddressFieldset( index, fields.username, fields.domain ) }
				</div>
				<div className="gsuite-add-users__name-fieldsets">
					{ this.renderNameFieldset( index, fields.firstName, fields.lastName ) }
				</div>
			</Fragment>
		);
	}
}

UserForm.propTypes = {};

export default localize( UserForm );
