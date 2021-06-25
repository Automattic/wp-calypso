/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { find, get, groupBy } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button, CompactCard } from '@automattic/components';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import { emailManagementAddGSuiteUsers } from 'calypso/my-sites/email/paths';
import FoldableCard from 'calypso/components/foldable-card';
import {
	getGmailUrl,
	getGoogleAdminUrl,
	getGoogleCalendarUrl,
	getGoogleDocsUrl,
	getGoogleDriveUrl,
	getGoogleSheetsUrl,
	getGoogleSlidesUrl,
	getProductType,
	hasPendingGSuiteUsers,
} from 'calypso/lib/gsuite';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import gmailIcon from 'calypso/assets/images/email-providers/google-workspace/services/gmail.svg';
import googleAdminIcon from 'calypso/assets/images/email-providers/google-workspace/services/admin.svg';
import googleCalendarIcon from 'calypso/assets/images/email-providers/google-workspace/services/calendar.svg';
import googleDocsIcon from 'calypso/assets/images/email-providers/google-workspace/services/docs.svg';
import googleDriveIcon from 'calypso/assets/images/email-providers/google-workspace/services/drive.svg';
import googleSheetsIcon from 'calypso/assets/images/email-providers/google-workspace/services/sheets.svg';
import googleSlidesIcon from 'calypso/assets/images/email-providers/google-workspace/services/slides.svg';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import GSuiteUserItem from 'calypso/my-sites/email/email-management/gsuite-user-item';
import { isEnabled } from '@automattic/calypso-config';
import Notice from 'calypso/components/notice';
import PendingGSuiteTosNotice from 'calypso/my-sites/domains/components/domain-warnings/pending-gsuite-tos-notice';
import TitanControlPanelLoginCard from 'calypso/my-sites/email/email-management/titan-control-panel-login-card';
import TitanManagementNav from 'calypso/my-sites/email/email-management/titan-management-nav';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { hasTitanMailWithUs } from 'calypso/lib/titan';

/**
 * Style dependencies
 */
import './style.scss';

class GSuiteUsersCard extends React.Component {
	canAddUsers( domainName ) {
		return this.props.domainsAsList.some(
			( domain ) =>
				domain &&
				domain.name === domainName &&
				get( domain, 'googleAppsSubscription.ownedByUserId' ) === this.props.user.ID
		);
	}

	isNewUser( user, subscribedDate ) {
		return this.props.moment().subtract( 1, 'day' ).isBefore( subscribedDate );
	}

	generateClickHandler( user ) {
		return () => {
			this.props.manageClick( user.domain, user.email );
		};
	}

	goToAddGoogleApps = () => {
		this.props.addGoogleAppsUserClick( this.props.selectedDomainName );
	};

	renderDomainWithGSuite( domainName, users ) {
		const { currentRoute, selectedSiteSlug, translate } = this.props;

		// Retrieves product information from the first user, which is fine as all users share exactly the same product data
		const { product_name: productName, product_slug: productSlug } = users[ 0 ];

		const header = (
			<>
				<img
					className="gsuite-users-card__foldable-card-header-icon"
					src={ googleWorkspaceIcon }
					alt={ translate( 'Google Workspace icon' ) }
				/>

				<span className="gsuite-users-card__foldable-card-header-text">
					<strong>{ productName }</strong>
					<em>{ domainName }</em>
				</span>
			</>
		);

		const summary = this.canAddUsers( domainName ) && (
			<Button
				primary
				compact
				href={ emailManagementAddGSuiteUsers(
					selectedSiteSlug,
					domainName,
					getProductType( productSlug ),
					currentRoute
				) }
				onClick={ this.goToAddGoogleApps }
			>
				{ translate( 'Add New Mailboxes' ) }
			</Button>
		);

		return (
			<div key={ `google-apps-user-${ domainName }` }>
				<FoldableCard
					className="gsuite-users-card__foldable-card"
					header={ header }
					summary={ summary }
					expandedSummary={ summary }
				>
					<ul className="gsuite-users-card__foldable-card-services">
						<li>
							<a href={ getGmailUrl( domainName ) } target="_blank" rel="noreferrer noopener">
								<img src={ gmailIcon } alt={ translate( 'Gmail icon' ) } />
								<strong>Gmail</strong>
							</a>
						</li>

						<li>
							<a href={ getGoogleAdminUrl( domainName ) } target="_blank" rel="noreferrer noopener">
								<img src={ googleAdminIcon } alt={ translate( 'Google Admin icon' ) } />
								<strong>Admin</strong>
							</a>
						</li>

						<li>
							<a
								href={ getGoogleCalendarUrl( domainName ) }
								target="_blank"
								rel="noreferrer noopener"
							>
								<img src={ googleCalendarIcon } alt={ translate( 'Google Calendar icon' ) } />
								<strong>Calendar</strong>
							</a>
						</li>

						<li>
							<a href={ getGoogleDocsUrl( domainName ) } target="_blank" rel="noreferrer noopener">
								<img src={ googleDocsIcon } alt={ translate( 'Google Docs icon' ) } />
								<strong>Docs</strong>
							</a>
						</li>

						<li>
							<a href={ getGoogleDriveUrl( domainName ) } target="_blank" rel="noreferrer noopener">
								<img src={ googleDriveIcon } alt={ translate( 'Google Drive icon' ) } />
								<strong>Drive</strong>
							</a>
						</li>

						<li>
							<a
								href={ getGoogleSheetsUrl( domainName ) }
								target="_blank"
								rel="noreferrer noopener"
							>
								<img src={ googleSheetsIcon } alt={ translate( 'Google Sheets icon' ) } />
								<strong>Sheets</strong>
							</a>
						</li>

						<li>
							<a
								href={ getGoogleSlidesUrl( domainName ) }
								target="_blank"
								rel="noreferrer noopener"
							>
								<img src={ googleSlidesIcon } alt={ translate( 'Google Slides icon' ) } />
								<strong>Slides</strong>
							</a>
						</li>
					</ul>
				</FoldableCard>

				<CompactCard className="gsuite-users-card__user-list">
					<ul className="gsuite-users-card__user-list-inner">
						{ users.map( ( user, index ) => this.renderUser( user, index ) ) }
					</ul>
				</CompactCard>
			</div>
		);
	}

	renderDomain( domain, users ) {
		if ( hasTitanMailWithUs( domain ) ) {
			const domainKey = `titan-${ domain.name }`;

			if ( isEnabled( 'titan/phase-2' ) ) {
				return <TitanManagementNav domain={ domain } key={ domainKey } />;
			}

			return <TitanControlPanelLoginCard domain={ domain } key={ domainKey } />;
		}

		return this.renderDomainWithGSuite( domain.name, users );
	}

	renderUser( user, index ) {
		if ( user.error ) {
			let status = 'is-warning';
			let text = user.error;
			let supportLink = (
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
			<GSuiteUserItem
				key={ `google-apps-user-${ user.domain }-${ index }` }
				user={ user }
				onClick={ this.generateClickHandler( user ) }
				siteSlug={ this.props.selectedSiteSlug }
			/>
		);
	}

	render() {
		const { domainsAsList, gsuiteUsers, selectedSiteSlug } = this.props;
		const pendingDomains = domainsAsList.filter( hasPendingGSuiteUsers );
		const usersByDomain = groupBy( gsuiteUsers, 'domain' );

		return (
			<div className="gsuite-users-card">
				{ pendingDomains.length !== 0 && (
					<PendingGSuiteTosNotice
						key="pending-gsuite-tos-notice"
						siteSlug={ selectedSiteSlug }
						domains={ pendingDomains }
						section="gsuite-users-manage-notice"
					/>
				) }

				{ domainsAsList
					.filter( ( domain ) => domain.name in usersByDomain || hasTitanMailWithUs( domain ) )
					.map( ( domain ) => this.renderDomain( domain, usersByDomain[ domain.name ] ) ) }
			</div>
		);
	}
}

const addGoogleAppsUserClick = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Add New User" Button in G Suite',
			'Domain Name',
			domainName
		),

		recordTracksEvent( 'calypso_domain_management_gsuite_add_gsuite_user_click', {
			domain_name: domainName,
		} )
	);

const manageClick = ( domainName, email ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Manage" link in G Suite',
			'User Email',
			email
		),

		recordTracksEvent( 'calypso_domain_management_gsuite_manage_click', {
			domain_name: domainName,
			email,
		} )
	);

GSuiteUsersCard.propTypes = {
	currentRoute: PropTypes.string,
	domains: PropTypes.array.isRequired,
	gsuiteUsers: PropTypes.array.isRequired,
	selectedDomainName: PropTypes.string,
	selectedSiteSlug: PropTypes.string.isRequired,
	user: PropTypes.object.isRequired,
};

export default connect(
	( state, ownProps ) => {
		const domainsList = ownProps.selectedDomainName
			? [ getSelectedDomain( ownProps ) ]
			: ownProps.domains;
		return {
			currentRoute: getCurrentRoute( state ),
			selectedSiteSlug: getSelectedSiteSlug( state ),
			user: getCurrentUser( state ),
			domainsAsList: domainsList,
		};
	},
	{ addGoogleAppsUserClick, manageClick }
)( localize( withLocalizedMoment( GSuiteUsersCard ) ) );
