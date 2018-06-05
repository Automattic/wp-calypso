/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import createReactClass from 'create-react-class';
import { find, get, groupBy } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Notice from 'components/notice';
import Button from 'components/button';
import PendingGappsTosNotice from 'my-sites/domains/components/domain-warnings/pending-gapps-tos-notice';
import { domainManagementAddGoogleApps } from 'my-sites/domains/paths';
import analyticsMixin from 'lib/mixins/analytics';
import SectionHeader from 'components/section-header';
import GoogleAppsUserItem from './google-apps-user-item';
import { getSelectedDomain, hasPendingGoogleAppsUsers } from 'lib/domains';
import { CALYPSO_CONTACT } from 'lib/url/support';

const GoogleAppsUsers = createReactClass( {
	displayName: 'GoogleAppsUsers',
	mixins: [ analyticsMixin( 'domainManagement', 'googleApps' ) ],

	propTypes: {
		domains: PropTypes.array.isRequired,
		googleAppsUsers: PropTypes.array.isRequired,
		selectedDomainName: PropTypes.string,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		user: PropTypes.object.isRequired,
	},

	getDomainsAsList() {
		return this.props.selectedDomainName ? [ getSelectedDomain( this.props ) ] : this.props.domains;
	},

	canAddUsers( domainName ) {
		return this.getDomainsAsList().some(
			domain =>
				domain.name === domainName &&
				get( domain, 'googleAppsSubscription.ownedByUserId' ) === this.props.user.ID
		);
	},

	isNewUser( user, subscribedDate ) {
		return this.props
			.moment()
			.subtract( 1, 'day' )
			.isBefore( subscribedDate );
	},

	generateClickHandler( user ) {
		return () => {
			this.recordEvent( 'manageClick', this.props.selectedDomainName, user );
		};
	},

	goToAddGoogleApps() {
		this.recordEvent( 'addGoogleAppsUserClick', this.props.selectedDomainName );
	},

	renderDomain( domain, users ) {
		return (
			<div key={ `google-apps-user-${ domain }` } className="google-apps-users-card">
				<SectionHeader label={ domain }>
					{ this.canAddUsers( domain ) && (
						<Button
							primary
							compact
							href={ domainManagementAddGoogleApps( this.props.selectedSite.slug, domain ) }
							onClick={ this.goToAddGoogleApps }
						>
							{ this.props.translate( 'Add G Suite User' ) }
						</Button>
					) }
				</SectionHeader>
				<CompactCard className="google-apps-users-card__user-list">
					<ul className="google-apps-users-card__user-list-inner">
						{ users.map( ( user, index ) => this.renderUser( user, index ) ) }
					</ul>
				</CompactCard>
			</div>
		);
	},

	renderUser( user, index ) {
		if ( user.error ) {
			let status = 'is-warning',
				text = user.error,
				supportLink = (
					<a href={ CALYPSO_CONTACT }>
						<strong>{ this.props.translate( 'Please contact support' ) }</strong>
					</a>
				);

			const domain = find( this.props.domains, { name: user.domain } );
			const subscribedDate = get( domain, 'googleAppsSubscription.subscribedDate', false );
			if ( subscribedDate ) {
				if ( this.isNewUser( user, subscribedDate ) ) {
					status = null;
					text = this.props.translate(
						'We are setting up %(email)s for you. It should start working immediately, but may take up to 24 hours.',
						{ args: { email: user.email } }
					);
					supportLink = null;
				}
			}

			return (
				<Notice
					key={ `google-apps-user-notice-${ user.domain }-${ index }` }
					showDismiss={ false }
					status={ status }
				>
					{ text } { supportLink }
				</Notice>
			);
		}

		return (
			<GoogleAppsUserItem
				key={ `google-apps-user-${ user.domain }-${ index }` }
				user={ user }
				onClick={ this.generateClickHandler( user ) }
			/>
		);
	},

	render() {
		const pendingDomains = this.getDomainsAsList().filter( hasPendingGoogleAppsUsers );
		const usersByDomain = groupBy( this.props.googleAppsUsers, 'domain' );

		return (
			<div>
				{ pendingDomains.length !== 0 && (
					<PendingGappsTosNotice
						key="pending-gapps-tos-notice"
						siteSlug={ this.props.selectedSite.slug }
						domains={ pendingDomains }
						section="google-apps"
					/>
				) }

				{ Object.keys( usersByDomain ).map( domain =>
					this.renderDomain( domain, usersByDomain[ domain ] )
				) }
			</div>
		);
	},
} );

export default localize( GoogleAppsUsers );
