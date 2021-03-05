/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button, Card, CompactCard } from '@automattic/components';
import canUserAddEmail from './can-user-add-email';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import DocumentHead from 'calypso/components/data/document-head';
import { domainAddNew } from 'calypso/my-sites/domains/paths';
import EmailManagementListItem from './email-management-list-item';
import EmptyContent from 'calypso/components/empty-content';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import FormattedHeader from 'calypso/components/formatted-header';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import HeaderCart from 'calypso/my-sites/checkout/cart/header-cart';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import QueryGSuiteUsers from 'calypso/components/data/query-gsuite-users';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { emailManagement } from 'calypso/my-sites/email/paths';

/**
 * Style dependencies
 */
import './style.scss';

const SITE_CONTEXT_NO_DOMAIN_NO_PLAN = 'no_domain_no_plan';
/* TODO: const SITE_CONTEXT_NO_DOMAIN_WITH_PLAN = 'no_domain_with_plan'; */

const USER_ACTION_JUST_DOMAIN = 'just_domain';
const USER_ACTION_START_UPGRADE = 'start_upgrade';

class EmailManagementList extends React.Component {
	static propTypes = {
		currentRoute: PropTypes.string.isRequired,
		domains: PropTypes.array.isRequired,
		selectedSite: PropTypes.object.isRequired,
		selectedSiteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

	handleJustDomainClick = ( siteContext ) => {
		this.recordCtaClick( siteContext, USER_ACTION_JUST_DOMAIN );

		page( domainAddNew( this.props.selectedSite.slug ) );
	};

	handleUpgradeClick = ( siteContext ) => {
		this.recordCtaClick( siteContext, USER_ACTION_START_UPGRADE );
	};

	recordCtaClick( siteContext, userAction ) {
		recordTracksEvent( 'calypso_email_management_no_domain_cta_click', {
			user_action: userAction,
			site_context: siteContext,
		} );
	}

	handleAddEmailToDomainClick = ( domainName ) => {
		const { currentRoute, selectedSite } = this.props;

		recordTracksEvent( 'calypso_email_management_add_email_to_domain', { domain: domainName } );

		page( emailManagement( selectedSite.slug, domainName, currentRoute ) );
	};

	renderNoDomainNoPlanCta() {
		const { translate } = this.props;

		const upgradeButton = (
			<Button primary onClick={ () => this.handleUpgradeClick( SITE_CONTEXT_NO_DOMAIN_NO_PLAN ) }>
				{ translate( 'Upgrade and claim my domain' ) }
			</Button>
		);

		const justDomainButton = (
			<Button onClick={ () => this.handleJustDomainClick( SITE_CONTEXT_NO_DOMAIN_NO_PLAN ) }>
				{ translate( 'Just buy a domain' ) }
			</Button>
		);

		return (
			<Card>
				<EmptyContent
					action={ upgradeButton }
					illustration="calypso/assets/images/customer-home/illustration--task-find-domain.svg"
					line={ translate(
						'Upgrade now and claim your domain (or just buy a domain!) and pick from one of our flexible options ' +
							'to connect your domain with email and start getting emails at your custom email address today.'
					) }
					secondaryAction={ justDomainButton }
					title={ translate( 'Get your own domain for a custom email address' ) }
				/>
			</Card>
		);
	}

	renderDomainsWithActiveEmail( domainsWithActiveEmail ) {
		if ( domainsWithActiveEmail.length === 0 ) {
			return null;
		}

		const { selectedSite, translate } = this.props;

		const activeEmailItems = domainsWithActiveEmail.map( ( domain, index ) => {
			return (
				<EmailManagementListItem
					domain={ domain }
					key={ `email-domain-${ domain.name }--${ index }` }
					selectedSite={ selectedSite }
				/>
			);
		} );

		return (
			<React.Fragment>
				<SectionHeader label={ translate( 'Active Email Plans' ) } />
				<div className="email-management-list__active-emails">{ activeEmailItems }</div>
			</React.Fragment>
		);
	}

	renderDomainsWithNoEmail( domainsWithNoEmail ) {
		if ( domainsWithNoEmail.length === 0 ) {
			return null;
		}

		const { translate } = this.props;

		return (
			<React.Fragment>
				<SectionHeader
					label={ translate( 'Other Domains' ) }
					className="email-management-list__other-domains-header"
				/>
				<div className="email-management-list__other-domains">
					{ domainsWithNoEmail.map( ( domain ) => this.renderDomainItemWithNoEmail( domain ) ) }
				</div>
			</React.Fragment>
		);
	}

	renderDomainItemWithNoEmail( domain ) {
		const { translate } = this.props;

		const addEmailButton = ! canUserAddEmail( domain ) ? null : (
			<Button
				className="email-management-list__other-domain-add-email-cta"
				compact
				onClick={ () => this.handleAddEmailToDomainClick( domain.name ) }
			>
				{ translate( 'Add Email' ) }
			</Button>
		);

		return (
			<CompactCard
				className="email-management-list__other-domain"
				key={ `other-domain-${ domain.name }` }
			>
				<span className="email-management-list__other-domain-name">{ domain.name }</span>
				<span className="email-management-list__other-domain-actions">{ addEmailButton }</span>
			</CompactCard>
		);
	}

	render() {
		const {
			currentRoute,
			domains,
			hasSiteDomainsLoaded,
			selectedSite,
			selectedSiteId,
			translate,
		} = this.props;

		const nonWpcomDomains = domains.filter( ( domain ) => ! domain.isWPCOMDomain );

		const domainHasEmail = ( domain ) =>
			hasTitanMailWithUs( domain ) || hasGSuiteWithUs( domain ) || hasEmailForwards( domain );

		const domainsWithEmail = nonWpcomDomains.filter( domainHasEmail );
		const domainsWithNoEmail = nonWpcomDomains.filter( ( domain ) => ! domainHasEmail( domain ) );

		return (
			<Main wideLayout>
				{ selectedSiteId && <QuerySiteDomains siteId={ selectedSiteId } /> }
				{ selectedSiteId && <QueryGSuiteUsers siteId={ selectedSiteId } /> }

				<DocumentHead title={ translate( 'Email' ) } />
				<div className="email-management-list__header">
					<FormattedHeader
						brandFont
						className="email-management-list__page-heading"
						headerText={ translate( 'Emails' ) }
						subHeaderText={ translate(
							'Your home base for accessing, setting up, and managing your emails.'
						) }
						align="left"
					/>
					<div className="email-management-list__header-buttons">
						<HeaderCart currentRoute={ currentRoute } selectedSite={ selectedSite } />
					</div>
				</div>

				{ ! hasSiteDomainsLoaded && (
					<React.Fragment>
						<SectionHeader className="email-management-list__section-placeholder is-placeholder" />
						<CompactCard className="email-management-list__content-placeholder is-placeholder" />
					</React.Fragment>
				) }
				{ hasSiteDomainsLoaded && this.renderDomainsWithActiveEmail( domainsWithEmail ) }
				{ hasSiteDomainsLoaded && this.renderDomainsWithNoEmail( domainsWithNoEmail ) }
			</Main>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		currentRoute: getCurrentRoute( state ),
		domains: getDomainsBySiteId( state, selectedSiteId ),
		hasSiteDomainsLoaded: hasLoadedSiteDomains( state, selectedSiteId ),
		selectedSite: getSelectedSite( state ),
		selectedSiteId,
	};
} )( localize( EmailManagementList ) );
