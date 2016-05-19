/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import PendingGappsTosNotice from 'my-sites/upgrades/components/domain-warnings/pending-gapps-tos-notice';
import paths from 'my-sites/upgrades/paths';
import analyticsMixin from 'lib/mixins/analytics';
import SectionHeader from 'components/section-header';
import GoogleAppsUserItem from './google-apps-user-item';
import { getSelectedDomain } from 'lib/domains';

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

	render() {
		const pendingDomains = this.getDomainsAsList().filter( domain =>
			domain.googleAppsSubscription &&
			domain.googleAppsSubscription.pendingUsers &&
			domain.googleAppsSubscription.pendingUsers.length !== 0 );

		return (
			<div>
				{ pendingDomains.length !== 0 && <PendingGappsTosNotice key="pending-gapps-tos-notice" siteSlug={ this.props.selectedSite.slug } domains={ pendingDomains } section="google-apps" /> }

				<SectionHeader
					count={ this.props.googleAppsUsers.length }
					label={ this.translate( 'Google Apps Users' ) }>
					{ this.canAddUsers() && (
						<a
							href={ paths.domainManagementAddGoogleApps(
								this.props.selectedSite.slug, this.props.selectedDomainName
							) }
							className="button is-compact is-primary"
							onClick={ this.goToAddGoogleApps }>
							{ this.translate( 'Add Google Apps User' ) }
						</a>
					) }
				</SectionHeader>

				<CompactCard className="google-apps-users-card">
					<ul className="google-apps-users-card__user-list">
						{ this.props.googleAppsUsers.map(
							( user, index ) => (
								<GoogleAppsUserItem
									key={ index } user={ user }
									onClick={ this.generateClickHandler( user ) }/>
							)
						) }
					</ul>
				</CompactCard>
			</div>
		);
	}
} );

export default GoogleAppsUsers;
