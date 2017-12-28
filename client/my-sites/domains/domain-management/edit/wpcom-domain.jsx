/** @format */

/**
 * External dependencies
 */

import React from 'react';

import createReactClass from 'create-react-class';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analyticsMixin from 'client/lib/mixins/analytics';
import Card from 'client/components/card/compact';
import Header from './card/header';
import Property from './card/property';
import VerticalNav from 'client/components/vertical-nav';
import VerticalNavItem from 'client/components/vertical-nav/item';

const WpcomDomain = createReactClass( {
	displayName: 'WpcomDomain',
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

	handleEditSiteAddressClick() {
		this.recordEvent( 'navigationClick', 'Edit Site Address', this.props.domain );
	},

	getEditSiteAddressBlock() {
		/**
		 * Hide Edit site address for .blog subdomains as this is unsupported for now.
		 */
		if ( this.props.domain.name.match( /\.\w+\.blog$/ ) ) {
			return null;
		}

		return (
			<VerticalNav>
				<VerticalNavItem
					path={ `https://${ this.props.domain
						.name }/wp-admin/index.php?page=my-blogs#blog_row_${ this.props.selectedSite.ID }` }
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

export default localize( WpcomDomain );
