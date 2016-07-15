/**
 * External dependencies
 */
import React from 'react';
import groupBy from 'lodash/groupBy';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Notice from 'components/notice';
import Button from 'components/button';
import PendingGappsTosNotice from 'my-sites/upgrades/components/domain-warnings/pending-gapps-tos-notice';
import paths from 'my-sites/upgrades/paths';
import analyticsMixin from 'lib/mixins/analytics';
import SectionHeader from 'components/section-header';
import GoogleAppsUserItem from './google-apps-user-item';
import { getSelectedDomain, hasPendingGoogleAppsUsers } from 'lib/domains';

const GoogleAppsUsers = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'googleApps' ) ],

	propTypes: {
		domains: React.PropTypes.object.isRequired,
		googleAppsUsers: React.PropTypes.array.isRequired,
		selectedDomainName: React.PropTypes.string,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		user: React.PropTypes.object.isRequired
	},

	getDomainsAsList() {
		return this.props.selectedDomainName
			? [ getSelectedDomain( this.props ) ]
			: this.props.domains.list;
	},

	canAddUsers() {
		return this.getDomainsAsList().some( domain =>
			domain.googleAppsSubscription.ownedByUserId === this.props.user.ID
		);
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
				<SectionHeader
					label={ domain }>
					{ this.canAddUsers() && (
						<Button
							primary
							compact
							href={ paths.domainManagementAddGoogleApps(
								this.props.selectedSite.slug, domain
							) }
							onClick={ this.goToAddGoogleApps }>
							{ this.translate( 'Add Google Apps User' ) }
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
			return (
				<Notice
					key={ `google-apps-user-notice-${ user.domain }-${ index }` }
					showDismiss={ false }
					status="is-warning"
					text={ user.error } />
			);
		}

		return (
			<GoogleAppsUserItem
				key={ `google-apps-user-${ user.domain }-${ index }` }
				user={ user }
				onClick={ this.generateClickHandler( user ) }/>
		);
	},

	render() {
		const pendingDomains = this.getDomainsAsList().filter( hasPendingGoogleAppsUsers ),
			usersByDomain = groupBy( this.props.googleAppsUsers, 'domain' );

		return (
			<div>
				{ pendingDomains.length !== 0 &&
					<PendingGappsTosNotice
						key="pending-gapps-tos-notice"
						siteSlug={ this.props.selectedSite.slug }
						domains={ pendingDomains }
						section="google-apps" />
				}

				{ Object.keys( usersByDomain ).map( ( domain ) => this.renderDomain( domain, usersByDomain[ domain ] ) ) }
			</div>
		);
	}
} );

export default GoogleAppsUsers;
