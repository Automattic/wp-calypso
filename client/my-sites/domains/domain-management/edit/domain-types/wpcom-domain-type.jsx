/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { domainManagementChangeSiteAddress, domainAddNew } from 'my-sites/domains/paths';
import { type as domainTypes } from 'lib/domains/constants';
import { getDomainTypeText } from 'lib/domains';
import { recordTracksEvent, recordGoogleEvent } from 'state/analytics/actions';
import MaterialIcon from 'components/material-icon';

class WpcomDomainType extends React.Component {
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
		const { domain } = this.props;

		const isWpcomDomain = get( domain, 'type' ) === domainTypes.WPCOM;

		if ( ! isWpcomDomain ) {
			return;
		}

		return (
			<VerticalNavItem
				path={ domainAddNew( this.props.selectedSite.slug ) }
				onClick={ this.handlePickCustomDomainClick }
				className="wpcom-domain-type__multiline-nav-item"
			>
				<MaterialIcon icon="search" className="wpcom-domain-type__multiline-nav-item-icon" />
				<div>
					<div>{ this.props.translate( 'Pick a custom domain' ) }</div>
					<small>{ this.props.translate( 'Register or transfer custom domain name' ) }</small>
				</div>
			</VerticalNavItem>
		);
	}

	getSiteAddressChange() {
		const { domain } = this.props;

		if ( domain.isWpcomStagingDomain ) {
			return;
		}

		const isWpcomDomain = get( domain, 'type' ) === domainTypes.WPCOM;
		const path = domainManagementChangeSiteAddress( this.props.selectedSite.slug, domain.name );

		return (
			<VerticalNavItem
				className="wpcom-domain-type__multiline-nav-item"
				path={
					isWpcomDomain
						? path
						: `https://${ this.props.domain.name }/wp-admin/index.php?page=my-blogs#blog_row_${ this.props.selectedSite.ID }`
				}
				external={ ! isWpcomDomain }
				onClick={
					isWpcomDomain ? this.handleChangeSiteAddressClick : this.handleEditSiteAddressClick
				}
			>
				<MaterialIcon icon="language" className="wpcom-domain-type__multiline-nav-item-icon" />
				<div>
					<div>
						{ isWpcomDomain
							? this.props.translate( 'Change WordPress.com Site Address' )
							: this.props.translate( 'Edit Site Address' ) }
					</div>
					<small>{ domain.name }</small>
				</div>
			</VerticalNavItem>
		);
	}

	getVerticalNavigation() {
		return (
			<VerticalNav>
				{ this.getSiteAddressChange() }
				{ this.getPickCustomDomain() }
			</VerticalNav>
		);
	}

	render() {
		const {
			domain: { name: domain_name },
		} = this.props;
		return (
			<div className="wpcom-domain-type__container">
				<Card
					compact={ true }
					className="wpcom-domain-type__status wpcom-domain-type__status-active"
				>
					<h2>{ domain_name }</h2>
					<div className="domain-types__active">
						<MaterialIcon icon="check_circle" /> Active
					</div>
				</Card>
				<Card compact={ true }>Expires: never</Card>
				{ this.getVerticalNavigation() }
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent, recordGoogleEvent } )(
	localize( WpcomDomainType )
);
