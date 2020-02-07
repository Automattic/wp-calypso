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

import { recordTracksEvent, recordGoogleEvent } from 'state/analytics/actions';
import MaterialIcon from 'components/material-icon';

class WpcomDomainType extends React.Component {
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
				<MaterialIcon icon="search" />
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
				<div className="wpcom-domain-type__multiline-nav-item">
					<div className="wpcom-domain-type__multiline-nav-item-icon">
						<MaterialIcon icon="language" />
					</div>
					<div>
						<div>
							{ isWpcomDomain
								? this.props.translate( 'Change Site Address' )
								: this.props.translate( 'Edit Site Address' ) }
						</div>
						<div>
							<small>{ domain.name }</small>
						</div>
					</div>
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
