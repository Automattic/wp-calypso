/** @format */
/**
 * External dependencies
 */
import React from 'react';
import createReactClass from 'create-react-class';
import { localize } from 'i18n-calypso';
import { flow, get } from 'lodash';

/**
 * Internal dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import Card from 'components/card';
import Header from './card/header';
import Property from './card/property';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import SiteAddressChanger from 'blocks/site-address-changer';
import { type as domainTypes } from 'lib/domains/constants';

const WpcomDomain = createReactClass( {
	displayName: 'WpcomDomain',
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

	handleEditSiteAddressClick() {
		this.recordEvent( 'navigationClick', 'Edit Site Address', this.props.domain );
	},

	getEditSiteAddressBlock() {
		const { domain } = this.props;
		if ( get( domain, 'type' ) === domainTypes.WPCOM ) {
			const dotblogSubdomain = get( domain, 'name', '' ).match( /\.\w+\.blog$/ );
			const domainSuffix = dotblogSubdomain ? dotblogSubdomain[ 0 ] : '.wordpress.com';
			return <SiteAddressChanger currentDomain={ domain } currentDomainSuffix={ domainSuffix } />;
		}

		return (
			<VerticalNav>
				<VerticalNavItem
					path={ `https://${ this.props.domain.name }/wp-admin/index.php?page=my-blogs#blog_row_${ this.props.selectedSite.ID }` }
					external={ true }
					onClick={ this.handleEditSiteAddressClick }
				>
					{ this.props.translate( 'Edit Site Address' ) }
				</VerticalNavItem>
			</VerticalNav>
		);
	},

	render() {
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
	},
} );

export default flow( localize )( WpcomDomain );
