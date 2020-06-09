/**
 * External dependencies
 */
import React from 'react';
import { getLocaleSlug, localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import { addQueryArgs } from '@wordpress/url';
import { withLocalizedMoment } from 'components/localized-moment';
import { getDomainTypeText, isSubdomain } from 'lib/domains';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import MaterialIcon from 'components/material-icon';
import {
	domainAddNew,
	domainManagementNameServers,
	domainManagementContactsPrivacy,
	domainManagementTransfer,
	domainManagementDns,
	domainManagementDomainConnectMapping,
	domainManagementChangeSiteAddress,
	domainManagementRedirectSettings,
	domainTransferIn,
	domainManagementSecurity,
} from 'my-sites/domains/paths';
import { emailManagement } from 'my-sites/email/paths';
import { type as domainTypes, transferStatus, sslStatuses } from 'lib/domains/constants';
import { recordTracksEvent, recordGoogleEvent } from 'state/analytics/actions';
import { isCancelable } from 'lib/purchases';
import { cancelPurchase } from 'me/purchases/paths';
import { getUnmappedUrl } from 'lib/site/utils';
import { withoutHttp } from 'lib/url';
import RemovePurchase from 'me/purchases/remove-purchase';
import { hasGSuiteWithUs, getGSuiteMailboxCount } from 'lib/gsuite';
import { getStepUrl } from 'signup/utils';

import './style.scss';

const DomainManagementNavigationItemContents = function ( props ) {
	const { materialIcon, text, description } = props;
	return (
		<React.Fragment>
			<MaterialIcon icon={ materialIcon } className="navigation__icon" />
			<div>
				<div>{ text }</div>
				<small>{ description }</small>
			</div>
		</React.Fragment>
	);
};

const DomainManagementNavigationItem = function ( props ) {
	const { path, onClick, external, materialIcon, text, description } = props;

	return (
		<VerticalNavItem
			path={ path }
			onClick={ onClick }
			external={ external }
			className="navigation__nav-item"
		>
			<DomainManagementNavigationItemContents
				materialIcon={ materialIcon }
				text={ text }
				description={ description }
			/>
		</VerticalNavItem>
	);
};

class DomainManagementNavigationEnhanced extends React.Component {
	isDomainInNormalState() {
		const { domain } = this.props;
		const { expired, pendingTransfer } = domain;
		return ! pendingTransfer && ! expired;
	}

	isDomainInGracePeriod() {
		const { domain, moment } = this.props;
		const { expiry } = domain;
		return moment().subtract( 18, 'days' ) <= moment( expiry );
	}

	getEmail() {
		const { selectedSite, translate, domain } = this.props;
		const { emailForwardsCount } = domain;

		if ( ! this.isDomainInNormalState() ) {
			return null;
		}

		let navigationDescription;

		let navigationText = translate( 'Manage your email accounts' );

		if ( hasGSuiteWithUs( domain ) ) {
			const gSuiteMailboxCount = getGSuiteMailboxCount( domain );

			navigationDescription = translate(
				'%(gSuiteMailboxCount)d mailbox',
				'%(gSuiteMailboxCount)d mailboxes',
				{
					count: gSuiteMailboxCount,
					args: {
						gSuiteMailboxCount,
					},
					comment: 'The number of GSuite mailboxes active for the current domain',
				}
			);
		} else if ( emailForwardsCount > 0 ) {
			navigationDescription = translate(
				'%(emailForwardsCount)d forward',
				'%(emailForwardsCount)d forwards',
				{
					count: emailForwardsCount,
					args: {
						emailForwardsCount,
					},
					comment: 'The number of email forwards active for the current domain',
				}
			);
		} else {
			navigationText = translate( 'Set up your email' );
			navigationDescription = translate( 'Not connected', {
				comment: 'The domain is not using any of the WordPress.com email solutions',
			} );
		}

		return (
			<DomainManagementNavigationItem
				path={ emailManagement( selectedSite.slug, domain.name ) }
				materialIcon="email"
				text={ navigationText }
				description={ navigationDescription }
			/>
		);
	}

	getDestinationText() {
		const { selectedSite, translate, domain } = this.props;

		const wpcomUrl = withoutHttp( getUnmappedUrl( selectedSite ) );
		const { pointsToWpcom, isPrimary } = domain;

		if ( pointsToWpcom && isPrimary ) {
			return translate( 'Destination: primary domain for %(wpcomUrl)s', {
				args: {
					wpcomUrl,
				},
			} );
		}

		if ( pointsToWpcom && ! isPrimary ) {
			return translate( 'Destination: %(wpcomUrl)s', {
				args: {
					wpcomUrl,
				},
			} );
		}

		return translate( 'Destination: external service' );
	}

	getNameServers() {
		const { translate, domain, selectedSite } = this.props;

		if ( ! this.isDomainInNormalState() && ! this.isDomainInGracePeriod() ) {
			return null;
		}

		const description = this.getDestinationText();

		return (
			<DomainManagementNavigationItem
				path={ domainManagementNameServers( selectedSite.slug, domain.name ) }
				materialIcon="language"
				text={ translate( 'Change your name servers & DNS records' ) }
				description={ description }
			/>
		);
	}

	getDnsRecords() {
		const { selectedSite, translate, domain } = this.props;

		const description = this.getDestinationText();

		return (
			<DomainManagementNavigationItem
				path={ domainManagementDns( selectedSite.slug, domain.name ) }
				materialIcon="language"
				text={ translate( 'Update your DNS records' ) }
				description={ description }
			/>
		);
	}

	getContactsAndPrivacy() {
		const { selectedSite, translate, domain } = this.props;
		const { privateDomain, privacyAvailable } = domain;

		if ( ! this.isDomainInNormalState() && ! this.isDomainInGracePeriod() ) {
			return null;
		}

		let description;
		if ( ! privacyAvailable ) {
			description = translate( 'Privacy protection: not available' );
		} else if ( privateDomain ) {
			description = translate( 'Privacy protection: on' );
		} else {
			description = translate( 'Privacy protection: off' );
		}

		return (
			<DomainManagementNavigationItem
				path={ domainManagementContactsPrivacy( selectedSite.slug, domain.name ) }
				materialIcon="chrome_reader_mode"
				text={ translate( 'Update your contact information' ) }
				description={ description }
			/>
		);
	}

	getTransferDomain() {
		const { moment, selectedSite, translate, domain } = this.props;
		const { expired, isLocked, transferAwayEligibleAt } = domain;

		if ( expired && ! this.isDomainInGracePeriod() ) {
			return null;
		}

		let description;

		if ( transferAwayEligibleAt ) {
			description = translate( 'Outbound transfers available after %(startDate)s', {
				args: {
					startDate: moment( transferAwayEligibleAt ).format( 'LL' ),
				},
				comment: '%(startDate)s is a date string, e.g. April 1, 2020',
			} );
		} else if ( isLocked ) {
			description = translate( 'Transfer lock: on' );
		} else {
			description = translate( 'Transfer lock: off' );
		}

		return (
			<DomainManagementNavigationItem
				path={ domainManagementTransfer( selectedSite.slug, domain.name ) }
				materialIcon="sync_alt"
				text={ translate( 'Transfer domain' ) }
				description={ description }
			/>
		);
	}

	getTransferMappedDomain() {
		const { selectedSite, domain, translate } = this.props;

		const { isEligibleForInboundTransfer } = domain;

		if ( ! isEligibleForInboundTransfer ) {
			return null;
		}

		return (
			<DomainManagementNavigationItem
				onClick={ this.handleTransferDomainClick }
				path={ domainTransferIn( selectedSite.slug, domain.name, true ) }
				materialIcon="sync_alt"
				text={ translate( 'Transfer your domain to WordPress.com' ) }
				description={ translate( 'Manage your site and domain all in one place' ) }
			/>
		);
	}

	getDomainConnectMapping() {
		const { selectedSite, domain, translate } = this.props;

		const { supportsDomainConnect, hasWpcomNameservers, pointsToWpcom } = domain;

		if ( ! supportsDomainConnect || hasWpcomNameservers || pointsToWpcom ) {
			return;
		}

		const path = domainManagementDomainConnectMapping( selectedSite.slug, domain.name );

		return (
			<DomainManagementNavigationItem
				path={ path }
				materialIcon="double_arrow"
				text={ translate( 'Connect your domain' ) }
				description={ translate( 'Point your domain to your site with zero hassle' ) }
			/>
		);
	}

	handleChangeSiteAddressClick = () => {
		const { domain } = this.props;
		const domainType = getDomainTypeText( domain );

		this.props.recordGoogleEvent(
			'Domain Management',
			`Clicked "Change Site Address" navigation link on a ${ domainType } in Edit`,
			'Domain Name',
			domain.name
		);

		this.props.recordTracksEvent( 'calypso_domain_management_change_navigation_click', {
			action: 'change_site_address',
			section: domain.type,
		} );
	};

	handleTransferDomainClick = () => {
		const { domain } = this.props;

		this.props.recordTracksEvent( 'calypso_domain_management_mapped_transfer_click', {
			section: domain.type,
			domain: domain.name,
		} );
	};

	handlePickCustomDomainClick = () => {
		const { domain } = this.props;
		const domainType = getDomainTypeText( domain );

		this.props.recordGoogleEvent(
			'Domain Management',
			`Clicked "Pick a custom domain" navigation link on a ${ domainType } in Edit`,
			'Domain Name',
			domain.name
		);

		this.props.recordTracksEvent( 'calypso_domain_management_wpcom_domain_add_domain', {
			action: 'change_site_address',
			section: domain.type,
		} );
	};

	handleDomainSecurityClick = () => {
		const { domain } = this.props;

		this.props.recordTracksEvent( 'calypso_domain_management_security_click', {
			section: domain.type,
		} );
	};

	getPickCustomDomain() {
		const { selectedSite, translate } = this.props;

		return (
			<DomainManagementNavigationItem
				path={ domainAddNew( selectedSite.slug ) }
				onClick={ this.handlePickCustomDomainClick }
				materialIcon="search"
				text={ translate( 'Pick a custom domain' ) }
				description={ translate( 'Matches available' ) }
			/>
		);
	}

	getSiteAddressChange() {
		const { domain, selectedSite, translate } = this.props;
		const { isWpcomStagingDomain } = domain;

		if ( isWpcomStagingDomain ) {
			return;
		}

		return (
			<DomainManagementNavigationItem
				path={ domainManagementChangeSiteAddress( selectedSite.slug, domain.name ) }
				onClick={ this.handleChangeSiteAddressClick }
				materialIcon="create"
				text={ translate( 'Change site address' ) }
				description={ domain.name }
			/>
		);
	}

	getSimilarDomains() {
		const { domain, selectedSite, translate } = this.props;

		if ( isSubdomain( domain.name ) ) {
			return null;
		}

		// we don't use the full domain name, to avoid an error about the taken domain
		const searchTerm = domain.name.split( '.' )[ 0 ];

		let path;

		if ( selectedSite && selectedSite.options && selectedSite.options.is_domain_only ) {
			path = addQueryArgs( getStepUrl( 'domain', 'domain-only', null, getLocaleSlug() ), {
				search: 'yes',
				new: searchTerm,
			} );
		} else {
			path = domainAddNew( selectedSite.slug, searchTerm );
		}

		return (
			<DomainManagementNavigationItem
				path={ path }
				onClick={ this.handlePickCustomDomainClick }
				materialIcon="search"
				text={ translate( 'Find similar domains' ) }
				description={ translate( 'Matches available' ) }
			/>
		);
	}

	getSecurity() {
		const { selectedSite, domain, translate } = this.props;

		const shouldRenderDomainSecurity = config.isEnabled(
			'domains/new-status-design/security-option'
		);

		if ( ! shouldRenderDomainSecurity ) {
			return null;
		}

		const { pointsToWpcom, sslStatus } = domain;

		if ( ! pointsToWpcom || ! sslStatus ) {
			return null;
		}

		let sslStatusHuman;
		switch ( sslStatus ) {
			case sslStatuses.SSL_PENDING:
				sslStatusHuman = translate( 'provisioning', {
					comment: 'Shows as "HTTPS encryption: provisioning" in the nav menu',
				} );
				break;
			case sslStatuses.SSL_ACTIVE:
				sslStatusHuman = translate( 'on', {
					comment: 'Shows as "HTTPS encryption: on" in the nav menu',
				} );
				break;
			case sslStatuses.SSL_DISABLED:
				sslStatusHuman = translate( 'disabled', {
					comment: 'Shows as "HTTPS encryption: disabled" in the nav menu',
				} );
				break;
		}

		return (
			<DomainManagementNavigationItem
				path={ domainManagementSecurity( selectedSite.slug, domain.name ) }
				onClick={ this.handleDomainSecurityClick }
				materialIcon="security"
				text={ translate( 'Review your domain security' ) }
				description={ translate( 'HTTPS encryption: %(sslStatusHuman)s', {
					args: { sslStatusHuman },
				} ) }
			/>
		);
	}

	getDeleteDomain() {
		const { domain, isLoadingPurchase, purchase, selectedSite, translate } = this.props;
		const domainType = domain && domain.type;

		if ( ! domain.currentUserCanManage ) {
			return null;
		}

		let title;

		if ( domainTypes.TRANSFER === domainType ) {
			const status = domain.transferStatus;

			if ( transferStatus.PENDING_OWNER === status || transferStatus.PENDING_REGISTRY === status ) {
				return null;
			}

			if ( status === transferStatus.CANCELLED ) {
				title = translate( 'Remove transfer from your account' );
			} else {
				title = translate( 'Cancel transfer' );
			}
		} else if ( domainTypes.MAPPED === domainType ) {
			title = translate( 'Delete domain mapping' );
		} else if ( domainTypes.SITE_REDIRECT === domainType ) {
			title = translate( 'Delete site redirect' );
		} else {
			title = translate( 'Delete your domain permanently' );
		}

		if ( isLoadingPurchase ) {
			return <VerticalNavItem isPlaceholder />;
		}

		if ( ! selectedSite || ! purchase ) {
			return null;
		}

		if ( isCancelable( purchase ) ) {
			const link = cancelPurchase( selectedSite.slug, purchase.id );

			return <DomainManagementNavigationItem path={ link } materialIcon="delete" text={ title } />;
		}

		return (
			<RemovePurchase
				hasLoadedSites={ true }
				hasLoadedUserPurchasesFromServer={ true }
				site={ selectedSite }
				purchase={ purchase }
				useVerticalNavItem={ true }
				className="navigation__nav-item is-clickable"
			>
				<span>
					<DomainManagementNavigationItemContents materialIcon="delete" text={ title } />
				</span>
			</RemovePurchase>
		);
	}

	getRedirectSettings() {
		const { domain, selectedSite, translate } = this.props;

		return (
			<DomainManagementNavigationItem
				path={ domainManagementRedirectSettings( selectedSite.slug, domain.name ) }
				materialIcon="language"
				text={ translate( 'Redirect settings' ) }
				description={ translate( 'Update your site redirect' ) }
			/>
		);
	}

	renderRegisteredDomainNavigation() {
		return (
			<React.Fragment>
				{ this.getNameServers() }
				{ this.getEmail() }
				{ this.getContactsAndPrivacy() }
				{ this.getTransferDomain() }
				{ this.getSecurity() }
				{ this.getSimilarDomains() }
				{ this.getDeleteDomain() }
			</React.Fragment>
		);
	}

	renderSiteRedirectNavigation() {
		return (
			<React.Fragment>
				{ this.getRedirectSettings() }
				{ this.getDeleteDomain() }
			</React.Fragment>
		);
	}

	renderMappedDomainNavigation() {
		return (
			<React.Fragment>
				{ this.getDnsRecords() }
				{ this.getEmail() }
				{ this.getDomainConnectMapping() }
				{ this.getTransferMappedDomain() }
				{ this.getSecurity() }
				{ this.getSimilarDomains() }
				{ this.getDeleteDomain() }
			</React.Fragment>
		);
	}

	renderTransferInDomainNavigation() {
		return <React.Fragment>{ this.getDeleteDomain() }</React.Fragment>;
	}

	renderWpcomDomainNavigation() {
		return (
			<React.Fragment>
				{ this.getSiteAddressChange() }
				{ this.getPickCustomDomain() }
			</React.Fragment>
		);
	}

	render() {
		const { domain } = this.props;
		const domainType = domain && domain.type;

		return (
			<VerticalNav>
				{ domainType === domainTypes.WPCOM && this.renderWpcomDomainNavigation() }
				{ domainType === domainTypes.MAPPED && this.renderMappedDomainNavigation() }
				{ domainType === domainTypes.REGISTERED && this.renderRegisteredDomainNavigation() }
				{ domainType === domainTypes.SITE_REDIRECT && this.renderSiteRedirectNavigation() }
				{ domainType === domainTypes.TRANSFER && this.renderTransferInDomainNavigation() }
			</VerticalNav>
		);
	}
}

export default connect( null, { recordTracksEvent, recordGoogleEvent } )(
	localize( withLocalizedMoment( DomainManagementNavigationEnhanced ) )
);
