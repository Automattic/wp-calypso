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
import Header from './card/header';
import Property from './card/property';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { domainManagementChangeSiteAddress } from 'my-sites/domains/paths';
import { getDomainTypeText } from 'lib/domains';
import { type as domainTypes } from 'lib/domains/constants';

import { recordTracksEvent, recordGoogleEvent } from 'state/analytics/actions';

class WpcomDomain extends React.Component {
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

	getEditSiteAddressBlock() {
		const { domain } = this.props;

		if ( domain.isWpcomStagingDomain ) {
			return;
		}

		const isWpcomDomain = get( domain, 'type' ) === domainTypes.WPCOM;
		const path = domainManagementChangeSiteAddress( this.props.selectedSite.slug, domain.name );

		return (
			<VerticalNav>
				<VerticalNavItem
					path={
						isWpcomDomain
							? path
							: `https://${ this.props.domain.name }/wp-admin/index.php?page=my-blogs#blog_row_${ this.props.selectedSite.ID }`
					}
					external={ isWpcomDomain ? false : true }
					onClick={
						isWpcomDomain ? this.handleChangeSiteAddressClick : this.handleEditSiteAddressClick
					}
				>
					{ isWpcomDomain
						? this.props.translate( 'Change Site Address' )
						: this.props.translate( 'Edit Site Address' ) }
				</VerticalNavItem>
			</VerticalNav>
		);
	}

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div>
				<div className="domain-details-card">
					<Header { ...this.props } />

					<Card>
						<Property label={ this.props.translate( 'Type', { context: 'A type of domain.' } ) }>
							{ this.props.translate( 'Included with Site' ) }
						</Property>

						<Property
							label={ this.props.translate( 'Renews on', {
								comment:
									'The corresponding date is in a different cell in the UI, the date is not included within the translated string',
							} ) }
						>
							<em>{ this.props.translate( 'Never Expires' ) }</em>
						</Property>
					</Card>
				</div>
				{ this.getEditSiteAddressBlock() }
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( null, { recordTracksEvent, recordGoogleEvent } )( localize( WpcomDomain ) );
