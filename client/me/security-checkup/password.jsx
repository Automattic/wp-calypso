/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getOKIcon } from './icons.js';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupPassword extends React.Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;

		const description = translate(
			'You have a password configured, but can change it at any time.'
		);

		return (
			<SecurityCheckupNavigationItem
				description={ description }
				materialIcon={ getOKIcon() }
				path="/me/security/password"
				text={ translate( 'Password' ) }
			/>
		);
	}
}

export default localize( SecurityCheckupPassword );
