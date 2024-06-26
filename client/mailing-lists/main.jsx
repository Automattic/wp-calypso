import page from '@automattic/calypso-router';
import { Card, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { addSubscriber, deleteSubscriber } from './utils';

class MainComponent extends Component {
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
			this.props.successNotice(
				this.state.isSubscribed ? this.getSubscribedMessage() : this.getUnsubscribedMessage(),
				{ overlay: false, showDismiss: false }
			);
		} else if ( this.state.isError ) {
			this.props.errorNotice(
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
		} else if ( 'affiliates' === category ) {
			return this.props.translate( 'Affiliates' );
		} else if ( 'digest' === category ) {
			return this.props.translate( 'Digests' );
		} else if ( 'news' === category ) {
			return this.props.translate( 'Newsletter' );
		} else if ( 'promotion' === category ) {
			return this.props.translate( 'Promotions' );
		} else if ( 'reports' === category ) {
			return this.props.translate( 'Reports' );
		} else if ( 'scheduled_updates' === category ) {
			return this.props.translate( 'Scheduled Updates' );
		} else if ( 'learn' === category ) {
			return this.props.translate( 'Learn Faster to Grow Faster' );
		} else if ( 'jetpack_marketing' === category ) {
			return this.props.translate( 'Jetpack Suggestions' );
		} else if ( 'jetpack_research' === category ) {
			return this.props.translate( 'Jetpack Research' );
		} else if ( 'jetpack_promotion' === category ) {
			return this.props.translate( 'Jetpack Promotions' );
		} else if ( 'jetpack_news' === category ) {
			return this.props.translate( 'Jetpack Newsletter' );
		} else if ( 'jetpack_reports' === category ) {
			return this.props.translate( 'Jetpack Reports' );
		} else if ( 'jetpack_manage_onboarding' === category ) {
			return this.props.translate( 'Jetpack Manage Onboarding' );
		} else if ( 'akismet_marketing' === category ) {
			return this.props.translate( 'Akismet Marketing' );
		} else if ( 'woopay_marketing' === category ) {
			return this.props.translate( 'WooPay Marketing' );
		} else if ( 'gravatar_onboarding' === category ) {
			return this.props.translate( 'Gravatar Onboarding' );
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
		} else if ( 'affiliates' === category ) {
			return this.props.translate(
				'Communications regarding the refer.wordpress.com affiliate program.'
			);
		} else if ( 'digest' === category ) {
			return this.props.translate( 'Popular content from the blogs you follow.' );
		} else if ( 'news' === category ) {
			return this.props.translate( 'WordPress.com news, announcements, and product spotlights.' );
		} else if ( 'promotion' === category ) {
			return this.props.translate(
				'Sales and promotions for WordPress.com products and services.'
			);
		} else if ( 'reports' === category ) {
			return this.props.translate(
				'Complimentary reports and updates regarding site performance and traffic.'
			);
		} else if ( 'scheduled_updates' === category ) {
			return this.props.translate( 'Complimentary reports regarding scheduled plugin updates.' );
		} else if ( 'learn' === category ) {
			return this.props.translate(
				'Take your WordPress.com site to new heights with expert webinars, courses, and community forums.'
			);
		} else if ( 'jetpack_marketing' === category ) {
			return this.props.translate( 'Tips for getting the most out of Jetpack.' );
		} else if ( 'jetpack_research' === category ) {
			return this.props.translate(
				'Opportunities to participate in Jetpack research and surveys.'
			);
		} else if ( 'jetpack_promotion' === category ) {
			return this.props.translate( 'Sales and promotions for Jetpack products and services.' );
		} else if ( 'jetpack_news' === category ) {
			return this.props.translate( 'Jetpack news, announcements, and product spotlights.' );
		} else if ( 'jetpack_reports' === category ) {
			return this.props.translate( 'Jetpack security and performance reports.' );
		} else if ( 'jetpack_manage_onboarding' === category ) {
			return this.props.translate( 'Jetpack Manage program setup and onboarding.' );
		} else if ( 'akismet_marketing' === category ) {
			return this.props.translate(
				'Relevant tips and new features to get the most out of Akismet'
			);
		} else if ( 'woopay_marketing' === category ) {
			return this.props.translate( 'Tips for getting the most out of WooPay.' );
		} else if ( 'gravatar_onboarding' === category ) {
			return this.props.translate(
				'Get tips and reminders to optimize your Gravatar profile setup.'
			);
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
		deleteSubscriber( this.props.category, this.props.email, this.props.hmac, this.props.context )
			.then( () => {
				this.setState( { isError: false, isSubscribed: false } );
			} )
			.catch( () => {
				this.setState( { isError: true } );
			} );
	};

	onResubscribeClick = () => {
		addSubscriber( this.props.category, this.props.email, this.props.hmac, this.props.context )
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

				{
					// Don't show the manage link for Gravatar-related categories.
					! this.getCategoryFromMessageTypeId()?.startsWith( 'gravatar_' ) && (
						<p className="mailing-lists__manage-link">
							<button
								className="mailing-lists__manage-button button is-link"
								onClick={ this.onManageUpdatesClick }
							>
								{ translate( 'Manage all your email subscriptions' ) }
							</button>
						</p>
					)
				}
			</div>
		);
	}
}

export default connect( null, {
	errorNotice,
	successNotice,
} )( localize( MainComponent ) );
