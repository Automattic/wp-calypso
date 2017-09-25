/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import HappychatButton from 'components/happychat/button';
import HappychatConnection from 'components/happychat/connection';
import support from 'lib/url/support';
import { recordTracksEvent } from 'state/analytics/actions';
import { isHappychatAvailable } from 'state/happychat/selectors';

export class HappinessSupport extends Component {
	static propTypes = {
		isJetpack: PropTypes.bool,
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
	}

	renderContactButton() {
		let url = support.CALYPSO_CONTACT,
			target = '';

		if ( this.props.isJetpack ) {
			url = support.JETPACK_CONTACT_SUPPORT;
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
			<HappychatButton borderless={ false } onClick={ this.onLiveChatButtonClick } className="happiness-support__livechat-button">
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
		let url = support.SUPPORT_ROOT;

		if ( this.props.isJetpack ) {
			url = support.JETPACK_SUPPORT;
		}

		return (
			<Button href={ url } target="_blank" rel="noopener noreferrer" className="happiness-support__support-button">
				{ this.props.translate( 'Search our support site' ) }
			</Button>
		);
	}

	render() {
		const classes = {
			'is-placeholder': this.props.isPlaceholder,
		};
		const { liveChatAvailable, showLiveChatButton, translate } = this.props;

		return (
			<div className={ classNames( 'happiness-support', classes ) }>
				{ this.renderIllustration() }

				<h3 className="happiness-support__heading">
					{ translate( 'Enjoy priority support from our Happiness Engineers' ) }
				</h3>

				<p className="happiness-support__text">
					{ translate(
						'{{strong}}Need help?{{/strong}} A Happiness Engineer can answer questions about your site, your account or how to do just about anything.', // eslint-disable-line max-len
						{
							components: {
								strong: <strong />
							}
						}
					) }
				</p>

				<div className="happiness-support__buttons">
					{ showLiveChatButton && <HappychatConnection /> }
					{ showLiveChatButton && liveChatAvailable ? this.renderLiveChatButton() : this.renderContactButton() }
					{ this.renderSupportButton() }
				</div>
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
