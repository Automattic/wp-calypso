/**
 * External dependencies
 */
import page from 'page';
import { localize } from 'i18n-calypso';
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import notices from 'notices';
import utils from './utils';
import { preventWidows } from 'lib/formatting';

/**
 * Constants
 */

class MainComponent extends React.Component {
    static displayName = 'MainComponent';

	state = {
		isError: false,
		isSubscribed: true
	};

	componentDidMount() {
		// Automatically call unsubscribe when the page is viewed in the browser;
		// it is done this way to prevent an accidental unsubscribe from occuring
		// if an email client prefetches the unsubscribe link in an email
		this.onUnsubscribeClick();
	}

	componentDidUpdate(prevProps, prevState) {
		if ( this.state.isSubscribed !== prevState.isSubscribed ) {
			notices.success( this.state.isSubscribed
				? this.getSubscribedMessage()
				: this.getUnsubscribedMessage(),
				{ overlay: false, showDismiss: false } );
		} else if ( this.state.isError ) {
			notices.error( this.state.isSubscribed
				? this.getUnsubscribedErrorMessage()
				: this.getSubscribedErrorMessage(),
				{ overlay: false, showDismiss: false } );
		}
	}

	getSubscribedMessage = () => {
		return this.props.translate( 'Subscribed to {{em}}%(categoryName)s{{/em}}', {
			args: {
				categoryName: this.getCategoryName()
			},
			components: {
				em: <em />
			}
		} );
	};

	getUnsubscribedMessage = () => {
		return this.props.translate( 'Unsubscribed from {{em}}%(categoryName)s{{/em}}', {
			args: {
				categoryName: this.getCategoryName()
			},
			components: {
				em: <em />
			}
		} );
	};

	getSubscribedErrorMessage = () => {
		return this.props.translate( 'Error subscribing to {{em}}%(categoryName)s{{/em}} mailing list! Try again later.', {
			args: {
				categoryName: this.getCategoryName()
			},
			components: {
				em: <em />
			}
		} );
	};

	getUnsubscribedErrorMessage = () => {
		return this.props.translate( 'Error unsubscribing from {{em}}%(categoryName)s{{/em}} mailing list! Try again later.', {
			args: {
				categoryName: this.getCategoryName()
			},
			components: {
				em: <em />
			}
		} );
	};

	getCategoryName = () => {
		if ( 'marketing' === this.props.category ) {
			return this.props.translate( 'Suggestions' );
		} else if ( 'research' === this.props.category ) {
			return this.props.translate( 'Research' );
		} else if ( 'community' === this.props.category ) {
			return this.props.translate( 'Community' );
		} else if ( 'digest' === this.props.category ) {
			return this.props.translate( 'Digests' );
		}

		return this.props.category;
	};

	getCategoryDescription = () => {
		if ( 'marketing' === this.props.category ) {
			return this.props.translate( 'Tips for getting the most out of WordPress.com.' );
		} else if ( 'research' === this.props.category ) {
			return this.props.translate( 'Opportunities to participate in WordPress.com research & surveys.' );
		} else if ( 'community' === this.props.category ) {
			return this.props.translate( 'Information on WordPress.com courses and events (online & in-person).' );
		} else if ( 'digest' === this.props.category ) {
			return this.props.translate( 'Reading & writing digests, tailored for you.' );
		}

		return null;
	};

	onUnsubscribeClick = () => {
		utils.deleteSubscriber( this.props.category, this.props.email, this.props.hmac, this.props.context ).then( () => {
			this.setState( { isError: false, isSubscribed: false } );
		} ).catch( () => {
			this.setState( { isError: true } );
		} );
	};

	onResubscribeClick = () => {
		utils.addSubscriber( this.props.category, this.props.email, this.props.hmac, this.props.context ).then( () => {
			this.setState( { isError: false, isSubscribed: true } );
		} ).catch( () => {
			this.setState( { isError: true } );
		} );
	};

	onManageUpdatesClick = () => {
		// Use redirect because we want to replace the history entry,
		// preventing the user from going back to the unsubscribe page
		page.redirect( '/me/notifications/updates' );
	};

	render() {
		var headingLabel = this.state.isSubscribed
								? this.props.translate( 'You\'re subscribed' )
								: this.props.translate( 'We\'ve unsubscribed your email.' ),
			messageLabel = this.state.isSubscribed
								? this.props.translate( 'We\'ll send you updates for this mailing list.' )
								: this.props.translate( 'You will no longer receive updates for this mailing list.' );

		return (
		    <div className="mailing-lists">
				<div className="mailing-lists__header">
					<Gridicon icon="mail" size={ 54 } />
					{ this.state.isSubscribed
						? null
						: <Gridicon icon="cross" size={ 24 } /> }
					<h1>{ preventWidows( headingLabel, 2 ) }</h1>
					<p>{ preventWidows( messageLabel, 2 ) }</p>
				</div>

				<Card className="mailing-lists__details">
					<h4>{ this.getCategoryName() }</h4>
					<p>{ this.getCategoryDescription() }</p>
					{ this.state.isSubscribed
						? <button className="button is-primary" onClick={ this.onUnsubscribeClick }>{ this.props.translate( 'Unsubscribe' ) }</button>
						: <button className="button" onClick={ this.onResubscribeClick }>{ this.props.translate( 'Resubscribe' ) }</button> }
				</Card>

				<p className="mailing-lists__manage-link"><button className="button is-link" onClick={ this.onManageUpdatesClick }>{ this.props.translate( 'Manage all your email subscriptions' ) }</button></p>
			</div>
		);
	}
}

export default localize(MainComponent);
