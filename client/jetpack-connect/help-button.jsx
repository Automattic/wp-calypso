/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';

export class JetpackConnectHelpButton extends PureComponent {
	static propTypes = { label: PropTypes.string };

	recordClick = () => void this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );

	render() {
		const { label, translate } = this.props;
		return (
			<LoggedOutFormLinkItem
				className="jetpack-connect__help-button"
				href="https://jetpack.com/contact-support"
				target="_blank"
				rel="noopener noreferrer"
				onClick={ this.recordClick }
			>
				<Gridicon icon="help-outline" size={ 18 } />{' '}
				{ label || translate( 'Get help setting up Jetpack' ) }
			</LoggedOutFormLinkItem>
		);
	}
}

export default connect(
	null,
	{ recordTracksEvent }
)( localize( JetpackConnectHelpButton ) );
