/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import { localize } from 'i18n-calypso';

export class JetpackConnectHelpButton extends PureComponent {
	static propTypes = {
		onClick: PropTypes.func,
		label: PropTypes.string,
	};


	render() {
		const { label, translate } = this.props;
		return (
			<LoggedOutFormLinkItem
				className="jetpack-connect__help-button"
				href="https://jetpack.com/contact-support"
				target="_blank"
				rel="noopener noreferrer"
				onClick={ this.props.onClick }
			>
				<Gridicon icon="help-outline" size={ 18 } />{' '}
				{ label || translate( 'Get help setting up Jetpack' ) }
			</LoggedOutFormLinkItem>
		);
	}
}

export default localize( JetpackConnectHelpButton );
