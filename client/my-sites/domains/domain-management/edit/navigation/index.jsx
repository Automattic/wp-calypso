/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

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
import { type as domainTypes } from 'lib/domains/constants';

import './style.scss';

const DomainManagementNavigationItem = function( props ) {
	const { path, onClick, external, materialIcon, text, description } = props;

	return (
		<VerticalNavItem
			path={ path }
			onClick={ onClick }
			external={ external }
			className="navigation__nav-item"
		>
			<MaterialIcon icon={ materialIcon } className="navigation__icon" />
			<div>
				<div>{ text }</div>
				<small>{ description }</small>
			</div>
		</VerticalNavItem>
	);
};

class DomainManagementNavigation extends React.Component {
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

		return (
			<DomainManagementNavigationItem
				path={ emailManagement( selectedSite.slug, domain.name ) }
				materialIcon="email"
				text={ translate( 'Email' ) }
				description={ null && translate( 'Destination: somewhere' ) }
			/>
		);
	}

	getNameServers() {
		const { selectedSite, translate, domain } = this.props;

		if ( ! this.isDomainInNormalState() && ! this.isDomainInGracePeriod() ) {
			return null;
		}

		return (
			<DomainManagementNavigationItem
				path={ domainManagementNameServers( selectedSite.slug, domain.name ) }
				materialIcon="language"
				text={ translate( 'Name servers and DNS' ) }
				description={ null && translate( 'Destination: somewhere' ) }
			/>
		);
	}

	getDnsRecords() {
		const { selectedSite, translate, domain } = this.props;

		return (
			<DomainManagementNavigationItem
				path={ domainManagementDns( selectedSite.slug, domain.name ) }
				materialIcon="language"
				text={ translate( 'DNS records' ) }
				description={ null && translate( 'Destination: somewhere' ) }
			/>
		);
	}

	getContactsAndPrivacy() {
		const { selectedSite, translate, domain } = this.props;

		if ( ! this.isDomainInNormalState() && ! this.isDomainInGracePeriod() ) {
			return null;
		}

		return (
			<DomainManagementNavigationItem
				path={ domainManagementContactsPrivacy( selectedSite.slug, domain.name ) }
				materialIcon="chrome_reader_mode"
				text={ translate( 'Contacts and privacy' ) }
				description={ null && translate( 'Privacy protection: on' ) }
			/>
		);
	}

	getTransferDomain() {
		const { selectedSite, translate, domain } = this.props;
		const { expired } = domain;

		if ( expired && ! this.isDomainInGracePeriod() ) {
			return null;
		}

		return (
			<DomainManagementNavigationItem
				path={ domainManagementTransfer( selectedSite.slug, domain.name ) }
				materialIcon="cached"
				text={ translate( 'Transfer domain' ) }
				description={ null && translate( 'Transfer lock: off' ) }
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

	handleEditSiteAddressClick = () => {
		const { domain } = this.props;
		const domainType = getDomainTypeText( domain );

		this.props.recordGoogleEvent(
			'Domain Management',
			`Clicked "Edit Site Address" navigation link on a ${ domainType } in Edit`,
			'Domain Name',
			domain.name
		);

		this.props.recordTracksEvent( 'calypso_domain_management_edit_navigation_click', {
			action: 'edit_site_address',
			section: domain.type,
		} );
	};

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
		const { domain, selectedSite, translate } = this.props;
		const { type } = domain;

		const isWpcomDomain = type === domainTypes.WPCOM;

		if ( ! isWpcomDomain ) {
			return;
		}

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
		const { isWpcomStagingDomain, type } = domain;

		if ( isWpcomStagingDomain ) {
			return;
		}

		const isWpcomDomain = type === domainTypes.WPCOM;

		const path = isWpcomDomain
			? domainManagementChangeSiteAddress( selectedSite.slug, domain.name )
			: `https://${ domain.name }/wp-admin/index.php?page=my-blogs#blog_row_${ selectedSite.ID }`;

		const onClick = isWpcomDomain
			? this.handleChangeSiteAddressClick
			: this.handleEditSiteAddressClick;

		const text = isWpcomDomain
			? translate( 'Change site address' )
			: translate( 'Edit site address' );

		return (
			<DomainManagementNavigationItem
				path={ path }
				external={ ! isWpcomDomain }
				onClick={ onClick }
				materialIcon="create"
				text={ text }
			/>
		);
	}

	renderRegisteredDomainNavigation() {
		return (
			<React.Fragment>
				{ this.getEmail() }
				{ this.getNameServers() }
				{ this.getContactsAndPrivacy() }
				{ this.getTransferDomain() }
			</React.Fragment>
		);
	}

	renderMappedDomainNavigation() {
		return (
			<React.Fragment>
				{ this.getEmail() }
				{ this.getDnsRecords() }
				{ this.getDomainConnectMapping() }
			</React.Fragment>
		);
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
			</VerticalNav>
		);
	}
}

export default localize( withLocalizedMoment( DomainManagementNavigation ) );
