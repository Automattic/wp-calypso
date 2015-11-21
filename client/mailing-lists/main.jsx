/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import notices from 'notices';
import utils from './utils';

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
		return this.translate( 'Successfully subscribed to {{em}}%(categoryName)s{{/em}} mailing list!', {
			args: {
				categoryName: this.getCategoryName()
			},
			components: {
				em: <em />
			}
		} );
	},

	getUnsubscribedMessage() {
		return this.translate( 'Successfully unsubscribed from {{em}}%(categoryName)s{{/em}} mailing list.', {
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
		return this.state.isSubscribed
			? this.renderUnsubscribe()
			: this.renderSubscribe();
	},

	renderUnsubscribe() {
		return (
			<Card>
				<FormSectionHeading>{ this.translate( 'Unsubscribe from Updates from WordPress.com' ) }</FormSectionHeading>
				{ this.renderCategoryAndEmail() }
				<button className="button is-primary" onClick={ this.onUnsubscribeClick }>{ this.translate( 'Unsubscribe' ) }</button>
			</Card>
		);
	},

	renderSubscribe() {
		return (
			<Card>
				<FormSectionHeading>{ this.translate( 'We\'re sorry to see you go!' ) }</FormSectionHeading>
				<p>{ this.translate( 'If you unsubscribed by mistake or changed your mind, resubscribe below.' ) }</p>
				{ this.renderCategoryAndEmail() }
				<button className="button is-primary" onClick={ this.onResubscribeClick }>{ this.translate( 'Resubscribe' ) }</button>
				{/* Hide link to manage all updates until that page is live.
				<p></p>
				<button className="button is-link" onClick={ this.onManageUpdatesClick }>{ this.translate( 'Manage all your updates from WordPress.com' ) }</button>
				*/}
			</Card>
		);
	},

	renderCategoryAndEmail() {
		return (
			<div>
				<FormFieldset>
					<FormLegend>{ this.translate( 'Category' ) }</FormLegend>
					{ this.getCategoryName() }
					<FormSettingExplanation>{ this.getCategoryDescription() }</FormSettingExplanation>
				</FormFieldset>

				<FormFieldset>
					<FormLegend>{ this.translate( 'Email Address' ) }</FormLegend>
					{ this.props.email }
				</FormFieldset>
			</div>
		);
	}
} );

export default MainComponent;
