/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import Main from 'components/main';
import { recordTracksEvent } from 'state/analytics/actions';

class NoDirectAccessError extends PureComponent {
	static propTypes = {
		action: PropTypes.string,
		actionURL: PropTypes.string,
		illustration: PropTypes.string,
		recordTracksEvent: PropTypes.func.isRequired,
		title: PropTypes.string,
		translate: PropTypes.func.isRequired,
		line: PropTypes.string,
	};

	static defaultProps = {
		illustration: '/calypso/images/illustrations/error.svg',
		actionURL: '/jetpack/connect',
	};

	render() {
		const { translate } = this.props;

		return (
			<Main className="jetpack-connect__main-error">
				<EmptyContent
					action={ this.props.action || translate( 'Go back to Jetpack Connect screen' ) }
					actionURL={ this.props.actionURL }
					illustration={ this.props.illustration }
					line={ this.props.line }
					title={
						this.props.title || translate( 'Oops, this URL should not be accessed directly' )
					}
				/>
				<LoggedOutFormLinks>
					<JetpackConnectHappychatButton>
						<HelpButton />
					</JetpackConnectHappychatButton>
				</LoggedOutFormLinks>
			</Main>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( NoDirectAccessError ) );
