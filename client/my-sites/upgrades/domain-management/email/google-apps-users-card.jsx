/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import paths from 'my-sites/upgrades/paths';
import ExternalLink from 'components/external-link';
import analyticsMixin from 'lib/mixins/analytics';
import SectionHeader from 'components/section-header';
import i18n from 'lib/mixins/i18n';
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

	canAddUsers() {
		const domainsInContext = this.props.selectedDomainName
			? [ getSelectedDomain( this.props ) ]
			: this.props.domains.list;
		return domainsInContext.some( domain =>
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
		return (
			<div>
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

const GoogleAppsUserItem = React.createClass( {
	propTypes: {
		user: React.PropTypes.object.isRequired,
		onClick: React.PropTypes.func
	},

	shouldComponentUpdate( nextProps ) {
		return this.props.user !== nextProps.user || this.props.onClick !== nextProps.onClick;
	},

	render() {
		return (
			<li>
				<span className="google-apps-users-card__user-email">
					{ this.props.user.email }
				</span>

				<ExternalLink
					icon
					className="google-apps-users-card__user-manage-link"
					href={ `https://admin.google.com/a/${ this.props.user.domain }` }
					target="_blank">
					{ i18n.translate( 'Manage', { context: 'Google Apps user item' } ) }
				</ExternalLink>
			</li>
		);
	}
} );

export default GoogleAppsUsers;
