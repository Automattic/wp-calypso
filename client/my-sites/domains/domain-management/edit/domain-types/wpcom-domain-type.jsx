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
import config from 'config';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { domainManagementChangeSiteAddress, domainAddNew } from 'my-sites/domains/paths';
import { type as domainTypes } from 'lib/domains/constants';
import { getDomainTypeText } from 'lib/domains';
import { recordTracksEvent, recordGoogleEvent } from 'state/analytics/actions';
import DomainStatus from '../card/domain-status';
import DomainManagementNavigation from '../navigation';

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
			>
				{ this.props.translate( 'Pick a custom domain' ) }
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
				{ isWpcomDomain
					? this.props.translate( 'Change site address' )
					: this.props.translate( 'Edit site address' ) }
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
			domain,
		} = this.props;

		const newDomainStatusNavigation = config.isEnabled( 'domains/new-status-design/navigation' );

		return (
			<div className="domain-types__container">
				<DomainStatus
					header={ domain_name }
					statusText={ this.props.translate( 'Active' ) }
					statusClass="status-success"
					icon="check_circle"
				/>
				{ newDomainStatusNavigation ? (
					<DomainManagementNavigation domain={ domain } selectedSite={ this.props.selectedSite } />
				) : (
					this.getVerticalNavigation()
				) }
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent, recordGoogleEvent } )(
	localize( WpcomDomainType )
);
