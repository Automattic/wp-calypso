/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import notices from 'notices';
import utils from './utils';
import { preventWidows } from 'lib/formatting';

/**
 * Constants
 */

const MainComponent = React.createClass( {
	displayName: 'MainComponent',

	getInitialState() {
		return {
			isError: false,
			isSubscribed: true
		};
	},

	componentDidMount() {
		// Automatically call unsubscribe when the page is viewed in the browser;
		// it is done this way to prevent an accidental unsubscribe from occuring
		// if an email client prefetches the unsubscribe link in an email
		this.onUnsubscribeClick();
	},

	componentDidUpdate( prevProps, prevState ) {
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
	},

	getSubscribedMessage() {
		return this.translate( 'Subscribed to {{em}}%(categoryName)s{{/em}}', {
			args: {
				categoryName: this.getCategoryName()
			},
			components: {
				em: <em />
			}
		} );
	},

	getUnsubscribedMessage() {
		return this.translate( 'Unsubscribed from {{em}}%(categoryName)s{{/em}}', {
			args: {
				categoryName: this.getCategoryName()
			},
			components: {
				em: <em />
			}
		} );
	},

	getSubscribedErrorMessage() {
		return this.translate( 'Error subscribing to {{em}}%(categoryName)s{{/em}} mailing list! Try again later.', {
			args: {
				categoryName: this.getCategoryName()
			},
			components: {
				em: <em />
			}
		} );
	},

	getUnsubscribedErrorMessage() {
		return this.translate( 'Error unsubscribing from {{em}}%(categoryName)s{{/em}} mailing list! Try again later.', {
			args: {
				categoryName: this.getCategoryName()
			},
			components: {
				em: <em />
			}
		} );
	},

	getCategoryName() {
		if ( 'marketing' === this.props.category ) {
			return this.translate( 'Suggestions' );
		} else if ( 'research' === this.props.category ) {
			return this.translate( 'Research' );
		} else if ( 'community' === this.props.category ) {
			return this.translate( 'Community' );
		}

		return this.props.category;
	},

	getCategoryDescription() {
		if ( 'marketing' === this.props.category ) {
			return this.translate( 'Tips for getting the most out of WordPress.com.' );
		} else if ( 'research' === this.props.category ) {
			return this.translate( 'Opportunities to participate in WordPress.com research & surveys.' );
		} else if ( 'community' === this.props.category ) {
			return this.translate( 'Information on WordPress.com courses and events (online & in-person).' );
		}

		return null;
	},

	onUnsubscribeClick() {
		utils.deleteSubscriber( this.props.category, this.props.email, this.props.hmac, this.props.context ).then( () => {
			this.setState( { isError: false, isSubscribed: false } );
		} ).catch( () => {
			this.setState( { isError: true } );
		} );
	},

	onResubscribeClick() {
		utils.addSubscriber( this.props.category, this.props.email, this.props.hmac, this.props.context ).then( () => {
			this.setState( { isError: false, isSubscribed: true } );
		} ).catch( () => {
			this.setState( { isError: true } );
		} );
	},

	onManageUpdatesClick() {
		// Use redirect because we want to replace the history entry,
		// preventing the user from going back to the unsubscribe page
		page.redirect( '/me/notifications/updates' );
	},

	render() {
		var headingLabel = this.state.isSubscribed
								? this.translate( 'You\'re subscribed' )
								: this.translate( 'We\'ve unsubscribed your email.' ),
			messageLabel = this.state.isSubscribed
								? this.translate( 'We\'ll send you updates for this mailing list.' )
								: this.translate( 'You will no longer receive updates for this mailing list.' );

		return(
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
						? <button className="button is-primary" onClick={ this.onUnsubscribeClick }>{ this.translate( 'Unsubscribe' ) }</button>
						: <button className="button" onClick={ this.onResubscribeClick }>{ this.translate( 'Resubscribe' ) }</button> }
				</Card>

				<p className="mailing-lists__manage-link"><button className="button is-link" onClick={ this.onManageUpdatesClick }>{ this.translate( 'Manage all your email subscriptions' ) }</button></p>
			</div>
		);
	}
} );

export default MainComponent;
