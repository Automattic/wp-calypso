/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import config from 'config';
import ExternalLink from 'components/external-link';
import FormTextInput from 'components/forms/form-text-input';
import { getPostsForQueryIgnoringPage } from 'state/posts/selectors';
import humanDate from 'lib/human-date';
import MultiCheckbox from 'components/forms/multi-checkbox';
import QueryPosts from 'components/data/query-posts';
import { recordTrack } from 'woocommerce/lib/analytics';

class ReadingWidget extends Component {
	state = {
		emailAddress: '',
		roles: [ 'storeOwner' ],
		subscriptionFormExpanded: false,
	};

	static propTypes = {
		query: PropTypes.object,
		siteId: PropTypes.number,
		text: PropTypes.string,
		title: PropTypes.string,
	};

	static defaultProps = {
		query: { category: 'start-your-store', number: 3 },
		siteId: config( 'woocommerce_blog_id' ),
	};

	getRolesAndLabels = () => {
		const { translate } = this.props;

		return [
			{ value: 'storeOwner', label: translate( 'Store owner' ) },
			{ value: 'developer', label: translate( 'Developer' ) },
			{ value: 'extensionDeveloper', label: translate( 'Extension developer' ) },
			{ value: 'other', label: translate( 'Other' ) },
		];
	};

	handleSubscriptionEmailFocus = () => {
		this.setState( { subscriptionFormExpanded: true } );
	};

	renderHeading = () => {
		const { text, title } = this.props;
		return (
			<div className="reading-widget__heading">
				<h2>{ title }</h2>
				<p>{ text }</p>
			</div>
		);
	};

	renderArticleList = () => {
		const { posts, query, siteId } = this.props;

		return (
			<div>
				<QueryPosts query={ query } siteId={ siteId } />
				<ul className="reading-widget__article-list">
					{ posts &&
						posts.map( ( post ) => {
							const { date, ID, title, URL } = post;
							return (
								<li key={ ID }>
									<ExternalLink
										icon={ true }
										href={ URL }
										rel="noopener noreferrer"
										target="_blank"
									>
										{ title }
									</ExternalLink>
									<span>{ humanDate( date ) }</span>
								</li>
							);
						} ) }
				</ul>
			</div>
		);
	};

	renderSubscriptionFormExplanation = ( expanded ) => {
		const { translate } = this.props;

		return (
			<div className="reading-widget__subscription-form-explanation">
				<p>
					{ translate(
						'Subscribe to our newsletter and get the latest' + ' news delivered to your inbox'
					) }
				</p>
				{ expanded && (
					<p>
						{ translate(
							'Before you subscribe, please specify your role(s)' +
								" in eCommerce and we'll send you the most relevant news & info"
						) }
					</p>
				) }
			</div>
		);
	};

	onEmailFocus = () => {
		this.setState( {
			subscriptionFormExpanded: true,
		} );
	};

	onEmailChange = ( e ) => {
		this.setState( {
			emailAddress: e.target.value,
		} );
	};

	onRolesChange = ( e ) => {
		this.setState( {
			roles: e.value,
		} );
	};

	isFormSubmittable = () => {
		const emailValidates = emailValidator.validate( this.state.emailAddress );
		const roleSelected = 0 < this.state.roles.length;

		return emailValidates && roleSelected;
	};

	onSubmit = () => {
		// TODO Logic for this. Not currently in use.
		recordTrack( 'calypso_woocommerce_dashboard_action_click', {
			action: 'subscribe',
		} );
	};

	renderSubscriptionFormFields = ( expanded ) => {
		const { translate } = this.props;
		return (
			<div className="reading-widget__subscription-form-fields">
				<FormTextInput
					onChange={ this.onEmailChange }
					onFocus={ this.onEmailFocus }
					placeholder={ translate( 'hello@email.com' ) }
					value={ this.state.emailAddress }
				/>
				{ expanded && (
					<MultiCheckbox
						checked={ this.state.roles }
						onChange={ this.onRolesChange }
						options={ this.getRolesAndLabels() }
					/>
				) }
				{ expanded && (
					<Button disabled={ ! this.isFormSubmittable() } onClick={ this.onSubmit }>
						{ translate( 'Subscribe' ) }
					</Button>
				) }
			</div>
		);
	};

	renderSubscriptionForm = () => {
		const expanded = this.state.subscriptionFormExpanded;

		return (
			<div className="reading-widget__subscription-form">
				{ this.renderSubscriptionFormExplanation( expanded ) }
				{ this.renderSubscriptionFormFields( expanded ) }
			</div>
		);
	};

	render = () => {
		return (
			<div className="reading-widget__container card">
				{ this.renderHeading() }
				{ this.renderArticleList() }
				{ this.renderSubscriptionForm() }
			</div>
		);
	};
}

export default connect( ( state, ownProps ) => {
	const siteId = ownProps.siteId ? ownProps.siteId : ReadingWidget.defaultProps.siteId;
	const query = ownProps.query ? ownProps.query : ReadingWidget.defaultProps.query;
	return {
		posts: getPostsForQueryIgnoringPage( state, siteId, query ),
	};
} )( localize( ReadingWidget ) );
