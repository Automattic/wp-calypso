/**
 * External dependencies
 */
import analytics from 'lib/analytics';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React from 'react';
import { sample } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gravatar from 'components/gravatar';
import { isHappychatAvailable } from 'state/happychat/selectors';
import support from 'lib/url/support';
import HappychatButton from 'components/happychat/button';
import HappychatConnection from 'components/happychat/connection';

const HappinessSupport = React.createClass( {
	propTypes: {
		isJetpack: React.PropTypes.bool,
		isPlaceholder: React.PropTypes.bool,
		liveChatButtonEventName: React.PropTypes.string,
		showLiveChatButton: React.PropTypes.bool,
	},

	getDefaultProps() {
		return {
			showLiveChatButton: false
		};
	},

	getInitialState() {
		return {
			user: sample( [
				{ display_name: 'Spencer', avatar_URL: '//gravatar.com/avatar/368dd11821ca7e9293d1707ab838f5c7' },
				{ display_name: 'Luca', avatar_URL: '//gravatar.com/avatar/7f7ba3ba8305287770e0cba76d1eb3db' }
			] )
		};
	},

	onLiveChatButtonClick() {
		if ( this.props.liveChatButtonEventName ) {
			analytics.tracks.recordEvent( this.props.liveChatButtonEventName );
		}
	},

	renderContactButton() {
		let url = support.CALYPSO_CONTACT,
			target = '';

		if ( this.props.isJetpack ) {
			url = support.JETPACK_CONTACT_SUPPORT;
			target = '_blank';
		}

		return (
			<Button href={ url } target={ target }>
				{ this.props.translate( 'Ask a question' ) }
			</Button>
		);
	},

	renderLiveChatButton() {
		return (
			<HappychatButton borderless={ false } onClick={ this.onLiveChatButtonClick }>
				{ this.props.translate( 'Ask a question' ) }
			</HappychatButton>
		);
	},

	renderGravatar() {
		return (
			<div className="happiness-support__gravatar">
				<Gravatar user={ this.state.user } size={ 80 } />
				<em className="happiness-support__gravatar-name">
					{ this.state.user.display_name }
				</em>
			</div>
		);
	},

	renderSupportButton() {
		let url = support.SUPPORT_ROOT;

		if ( this.props.isJetpack ) {
			url = support.JETPACK_SUPPORT;
		}

		return (
			<Button href={ url } target="_blank" rel="noopener noreferrer">
				{ this.props.translate( 'Search our support site' ) }
			</Button>
		);
	},

	render() {
		const classes = {
			'happiness-support': true,
			'is-placeholder': this.props.isPlaceholder
		};
		const { liveChatAvailable, showLiveChatButton } = this.props;

		return (
			<div className={ classNames( classes ) }>
				{ this.renderGravatar() }

				<h3 className="happiness-support__heading">
					{ this.props.translate( 'Enjoy priority support from our Happiness Engineers' ) }
				</h3>

				<p className="happiness-support__text">
					{ this.props.translate(
						'{{strong}}Need help?{{/strong}} A Happiness Engineer can answer questions about your site, your account or how to do just about anything.',
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
} );

export default connect(
	state => {
		return {
			liveChatAvailable: isHappychatAvailable( state ),
		};
	}
)( localize( HappinessSupport ) );
