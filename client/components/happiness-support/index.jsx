/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import {
	CALYPSO_CONTACT,
	JETPACK_CONTACT_SUPPORT,
	JETPACK_SUPPORT,
	SUPPORT_ROOT,
} from 'lib/url/support';
import HappychatButton from 'components/happychat/button';
import HappychatConnection from 'components/happychat/connection-connected';
import { recordTracksEvent } from 'state/analytics/actions';

export class HappinessSupport extends Component {
	static propTypes = {
		isJetpack: PropTypes.bool,
		isJetpackFreePlan: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
		liveChatButtonEventName: PropTypes.string,
		showLiveChatButton: PropTypes.bool,
	};

	static defaultProps = {
		showLiveChatButton: false,
	};

	onLiveChatButtonClick = () => {
		if ( this.props.liveChatButtonEventName ) {
			this.props.recordTracksEvent( this.props.liveChatButtonEventName );
		}
	};

	getHeadingText() {
		const { isJetpackFreePlan, translate } = this.props;
		return isJetpackFreePlan
			? translate( 'Support documentation' )
			: translate( 'Priority support' );
	}

	getSupportText() {
		const { isJetpackFreePlan, translate } = this.props;
		const components = {
			strong: <strong />,
		};
		return isJetpackFreePlan
			? translate(
					'{{strong}}Need help?{{/strong}} Search our support site to find out about your site, your account, and how to make the most of WordPress.', // eslint-disable-line max-len
					{ components }
				)
			: translate(
					'{{strong}}Need help?{{/strong}} A Happiness Engineer can answer questions about your site and your account.', // eslint-disable-line max-len
					{ components }
				);
	}

	getSupportButtons() {
		const { isJetpackFreePlan, liveChatAvailable, showLiveChatButton } = this.props;

		if ( isJetpackFreePlan ) {
			return (
				<div className="happiness-support__buttons">
					{ this.renderSupportButton() }
					{ this.renderContactButton() }
				</div>
			);
		}

		return (
			<div className="happiness-support__buttons">
				{ showLiveChatButton && <HappychatConnection /> }
				{ showLiveChatButton && liveChatAvailable
					? this.renderLiveChatButton()
					: this.renderContactButton() }
				{ this.renderSupportButton() }
			</div>
		);
	}

	renderContactButton() {
		let url = CALYPSO_CONTACT,
			target = '';

		if ( this.props.isJetpack ) {
			url = JETPACK_CONTACT_SUPPORT;
			target = '_blank';
		}

		return (
			<Button href={ url } target={ target } className="happiness-support__contact-button">
				{ this.props.translate( 'Ask a question' ) }
			</Button>
		);
	}

	renderLiveChatButton() {
		return (
			<HappychatButton
				borderless={ false }
				onClick={ this.onLiveChatButtonClick }
				className="happiness-support__livechat-button"
			>
				{ this.props.translate( 'Ask a question' ) }
			</HappychatButton>
		);
	}

	renderIllustration() {
		return (
			<div className="happiness-support__illustration">
				<img src="/calypso/images/illustrations/happiness-support.svg" />
			</div>
		);
	}

	renderSupportButton() {
		let url = SUPPORT_ROOT;

		if ( this.props.isJetpack ) {
			url = JETPACK_SUPPORT;
		}

		return (
			<Button
				href={ url }
				target="_blank"
				rel="noopener noreferrer"
				className="happiness-support__support-button"
			>
				{ this.props.translate( 'Search our support site' ) }
			</Button>
		);
	}

	render() {
		const classes = {
			'is-placeholder': this.props.isPlaceholder,
		};

		return (
			<div className={ classNames( 'happiness-support', classes ) }>
				{ this.renderIllustration() }

				<h3 className="happiness-support__heading">{ this.getHeadingText() }</h3>

				<p className="happiness-support__text">{ this.getSupportText() }</p>

				{ this.getSupportButtons() }
			</div>
		);
	}
}

export default connect(
	state => ( {
		liveChatAvailable: isHappychatAvailable( state ),
	} ),
	{ recordTracksEvent }
)( localize( HappinessSupport ) );
