/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { withLocalizedMoment } from 'components/localized-moment';
import { getDomainTypeText } from 'lib/domains';
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
} from 'my-sites/domains/paths';
import { emailManagement } from 'my-sites/email/paths';
import { type as domainTypes, transferStatus } from 'lib/domains/constants';
import { recordTracksEvent, recordGoogleEvent } from 'state/analytics/actions';
import { isCancelable } from 'lib/purchases';
import { cancelPurchase } from 'me/purchases/paths';
import RemovePurchase from 'me/purchases/remove-purchase';

import './style.scss';

const DomainManagementNavigationItemContents = function( props ) {
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

const DomainManagementNavigationItem = function( props ) {
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

		if ( ! this.isDomainInNormalState() ) {
			return null;
		}

		// NOTE: remember to add translate to the description string once you start working on it
		return (
			<DomainManagementNavigationItem
				path={ emailManagement( selectedSite.slug, domain.name ) }
				materialIcon="email"
				text={ translate( 'Manage your email accounts' ) }
				description={ '3 G Suite accounts' }
			/>
		);
	}

	getNameServers() {
		const { selectedSite, translate, domain } = this.props;

		if ( ! this.isDomainInNormalState() && ! this.isDomainInGracePeriod() ) {
			return null;
		}

		const { wpcom_url: wpcomUrl } = selectedSite;
		const { hasWpcomNameservers, pointsToWpcom, isPrimary } = domain;

		let description;

		if ( hasWpcomNameservers && pointsToWpcom && isPrimary ) {
			description = translate( 'Destination: Primary domain for %(wpcomUrl)s', {
				args: {
					wpcomUrl,
				},
			} );
		} else if ( hasWpcomNameservers && pointsToWpcom && ! isPrimary ) {
			description = translate( 'Destination: %(wpcomUrl)s', {
				args: {
					wpcomUrl,
				},
			} );
		} else {
			description = translate( 'Destination: external to WordPress.com' );
		}

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

		// NOTE: remember to add translate to the description string once you start working on it
		return (
			<DomainManagementNavigationItem
				path={ domainManagementDns( selectedSite.slug, domain.name ) }
				materialIcon="language"
				text={ translate( 'DNS records' ) }
				description={ 'Destination: somewhere' }
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
			description = translate( 'Privacy protection: yes' );
		} else {
			description = translate( 'Privacy protection: no' );
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
		const { selectedSite, translate, domain } = this.props;
		const { expired } = domain;

		if ( expired && ! this.isDomainInGracePeriod() ) {
			return null;
		}

		// NOTE: remember to add translate to the description string once you start working on it
		return (
			<DomainManagementNavigationItem
				path={ domainManagementTransfer( selectedSite.slug, domain.name ) }
				materialIcon="sync_alt"
				text={ translate( 'Transfer domain' ) }
				description={ 'Transfer lock: off' }
			/>
		);
	}

	getDomainConnectMapping() {
		const { selectedSite, translate, domain } = this.props;

		const { supportsDomainConnect, hasWpcomNameservers, pointsToWpcom } = domain;

		if ( ! supportsDomainConnect || hasWpcomNameservers || pointsToWpcom ) {
			return;
		}

		const path = domainManagementDomainConnectMapping( selectedSite.slug, domain.name );

		return (
			<DomainManagementNavigationItem
				path={ path }
				materialIcon="cached"
				text={ translate( 'Connect your domain' ) }
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

	getPickCustomDomain() {
		const { selectedSite, translate } = this.props;

		return (
			<DomainManagementNavigationItem
				path={ domainAddNew( selectedSite.slug ) }
				onClick={ this.handlePickCustomDomainClick }
				materialIcon="search"
				text={ translate( 'Pick a custom domain' ) }
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
			/>
		);
	}

	getSimilarDomains() {
		const { selectedSite, translate } = this.props;

		// NOTE: remember to add translate to the description string once you start working on it
		return (
			<DomainManagementNavigationItem
				path={ domainAddNew( selectedSite.slug ) }
				onClick={ this.handlePickCustomDomainClick }
				materialIcon="search"
				text={ translate( 'Find similar domains' ) }
				description={ 'Placeholder text' }
			/>
		);
	}

	getSecurity() {
		const { selectedSite, translate } = this.props;

		// NOTE: remember to add translate to the description string once you start working on it
		return (
			<DomainManagementNavigationItem
				path={ domainAddNew( selectedSite.slug ) }
				onClick={ this.handlePickCustomDomainClick }
				materialIcon="security"
				text={ translate( 'Review your domain security' ) }
				description={ 'HTTPS encryption: on' }
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

	renderMappedDomainNavigation() {
		return (
			<React.Fragment>
				{ this.getEmail() }
				{ this.getDnsRecords() }
				{ this.getDomainConnectMapping() }
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
				{ domainType === domainTypes.TRANSFER && this.renderTransferInDomainNavigation() }
			</VerticalNav>
		);
	}
}

export default connect( null, { recordTracksEvent, recordGoogleEvent } )(
	localize( withLocalizedMoment( DomainManagementNavigationEnhanced ) )
);
