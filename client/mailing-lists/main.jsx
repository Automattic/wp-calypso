/**
 * External dependencies
 */

import page from 'page';
import React from 'react';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import notices from 'calypso/notices';
import utils from './utils';
import { preventWidows } from 'calypso/lib/formatting';

/**
 * Constants
 */

class MainComponent extends React.Component {
	static displayName = 'MainComponent';

	state = {
		isError: false,
		isSubscribed: true,
	};

	componentDidMount() {
		// Automatically call unsubscribe when the page is viewed in the browser;
		// it is done this way to prevent an accidental unsubscribe from occuring
		// if an email client prefetches the unsubscribe link in an email
		this.onUnsubscribeClick();
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( this.state.isSubscribed !== prevState.isSubscribed ) {
			notices.success(
				this.state.isSubscribed ? this.getSubscribedMessage() : this.getUnsubscribedMessage(),
				{ overlay: false, showDismiss: false }
			);
		} else if ( this.state.isError ) {
			notices.error(
				this.state.isSubscribed
					? this.getUnsubscribedErrorMessage()
					: this.getSubscribedErrorMessage(),
				{ overlay: false, showDismiss: false }
			);
		}
	}

	getSubscribedMessage = () => {
		return this.props.translate( 'Subscribed to {{em}}%(categoryName)s{{/em}}', {
			args: {
				categoryName: this.getCategoryName(),
			},
			components: {
				em: <em />,
			},
		} );
	};

	getUnsubscribedMessage = () => {
		return this.props.translate( 'Unsubscribed from {{em}}%(categoryName)s{{/em}}', {
			args: {
				categoryName: this.getCategoryName(),
			},
			components: {
				em: <em />,
			},
		} );
	};

	getSubscribedErrorMessage = () => {
		return this.props.translate(
			'Error subscribing to {{em}}%(categoryName)s{{/em}} mailing list! Try again later.',
			{
				args: {
					categoryName: this.getCategoryName(),
				},
				components: {
					em: <em />,
				},
			}
		);
	};

	getUnsubscribedErrorMessage = () => {
		return this.props.translate(
			'Error unsubscribing from {{em}}%(categoryName)s{{/em}} mailing list! Try again later.',
			{
				args: {
					categoryName: this.getCategoryName(),
				},
				components: {
					em: <em />,
				},
			}
		);
	};

	getCategoryName = () => {
		const category = this.getCategoryFromMessageTypeId();
		if ( 'marketing' === category ) {
			return this.props.translate( 'Suggestions' );
		} else if ( 'research' === category ) {
			return this.props.translate( 'Research' );
		} else if ( 'community' === category ) {
			return this.props.translate( 'Community' );
		} else if ( 'digest' === category ) {
			return this.props.translate( 'Digests' );
		} else if ( 'news' === category ) {
			return this.props.translate( 'Newsletter' );
		} else if ( 'jetpack_marketing' === category ) {
			return this.props.translate( 'Jetpack Suggestions' );
		} else if ( 'jetpack_research' === category ) {
			return this.props.translate( 'Jetpack Research' );
		} else if ( 'jetpack_promotion' === category ) {
			return this.props.translate( 'Jetpack Promotions' );
		} else if ( 'jetpack_news' === category ) {
			return this.props.translate( 'Jetpack Newsletter' );
		}

		return category;
	};

	getCategoryDescription = () => {
		const category = this.getCategoryFromMessageTypeId();
		if ( 'marketing' === category ) {
			return this.props.translate( 'Tips for getting the most out of WordPress.com.' );
		} else if ( 'research' === category ) {
			return this.props.translate(
				'Opportunities to participate in WordPress.com research and surveys.'
			);
		} else if ( 'community' === category ) {
			return this.props.translate(
				'Information on WordPress.com courses and events (online and in-person).'
			);
		} else if ( 'digest' === category ) {
			return this.props.translate(
				'Popular content from the blogs you follow, and reports on your own site and its performance.'
			);
		} else if ( 'news' === category ) {
			return this.props.translate( 'WordPress.com news, announcements, and product spotlights.' );
		} else if ( 'jetpack_marketing' === category ) {
			return this.props.translate( 'Tips for getting the most out of Jetpack.' );
		} else if ( 'jetpack_research' === category ) {
			return this.props.translate(
				'Opportunities to participate in Jetpack research and surveys.'
			);
		} else if ( 'jetpack_promotion' === category ) {
			return this.props.translate( 'Promotions and deals on upgrades.' );
		} else if ( 'jetpack_news' === category ) {
			return this.props.translate( 'Jetpack news, announcements, and product spotlights.' );
		}

		return null;
	};

	/*
	 * If category is in the list of those that should be mapped, return the mapped value. Otherwise just return the existing category.
	 * Some unsubscribe links contain a numeric category.
	 * These are Iterable message type ids that we need to map to our internal categories.
	 */
	getCategoryFromMessageTypeId = () => {
		switch ( this.props.category ) {
			case '20659':
				return 'marketing';
			case '20784':
				return 'research';
			case '20786':
				return 'community';
			case '20796':
				return 'digest';
			case '20783':
				return 'promotion';
			case '20785':
				return 'news';
			case '22504':
				return 'jetpack_marketing';
			case '22507':
				return 'jetpack_research';
			case '22506':
				return 'jetpack_promotion';
			case '22505':
				return 'jetpack_news';
			default:
				return this.props.category;
		}
	};

	onUnsubscribeClick = () => {
		utils
			.deleteSubscriber(
				this.props.category,
				this.props.email,
				this.props.hmac,
				this.props.context
			)
			.then( () => {
				this.setState( { isError: false, isSubscribed: false } );
			} )
			.catch( () => {
				this.setState( { isError: true } );
			} );
	};

	onResubscribeClick = () => {
		utils
			.addSubscriber( this.props.category, this.props.email, this.props.hmac, this.props.context )
			.then( () => {
				this.setState( { isError: false, isSubscribed: true } );
			} )
			.catch( () => {
				this.setState( { isError: true } );
			} );
	};

	onManageUpdatesClick = () => {
		// Use redirect because we want to replace the history entry,
		// preventing the user from going back to the unsubscribe page
		page.redirect( '/me/notifications/updates' );
	};

	render() {
		const translate = this.props.translate;
		const headingLabel = this.state.isSubscribed
			? translate( "You're subscribed" )
			: translate( "We've unsubscribed your email." );
		const messageLabel = this.state.isSubscribed
			? translate( "We'll send you updates for this mailing list." )
			: translate( 'You will no longer receive updates for this mailing list.' );

		return (
			<div className="mailing-lists">
				<div className="mailing-lists__header">
					<Gridicon icon="mail" size={ 54 } />
					{ this.state.isSubscribed ? null : <Gridicon icon="cross" size={ 24 } /> }
					<h1>{ preventWidows( headingLabel, 2 ) }</h1>
					<p>{ preventWidows( messageLabel, 2 ) }</p>
				</div>

				<Card className="mailing-lists__details">
					<h4>{ this.getCategoryName() }</h4>
					<p>{ this.getCategoryDescription() }</p>
					{ this.state.isSubscribed ? (
						<button
							className="mailing-lists__unsubscribe-button button is-primary"
							onClick={ this.onUnsubscribeClick }
						>
							{ translate( 'Unsubscribe' ) }
						</button>
					) : (
						<button
							className="mailing-lists__resubscribe-button button"
							onClick={ this.onResubscribeClick }
						>
							{ translate( 'Resubscribe' ) }
						</button>
					) }
				</Card>

				<p className="mailing-lists__manage-link">
					<button
						className="mailing-lists__manage-button button is-link"
						onClick={ this.onManageUpdatesClick }
					>
						{ translate( 'Manage all your email subscriptions' ) }
					</button>
				</p>
			</div>
		);
	}
}

export default localize( MainComponent );
