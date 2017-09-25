/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Header from './card/header';
import Property from './card/property';
import Card from 'components/card/compact';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import analyticsMixin from 'lib/mixins/analytics';

const WpcomDomain = React.createClass( {
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
					path={ `https://${ this.props.domain.name }/wp-admin/index.php?page=my-blogs#blog_row_${ this.props.selectedSite.ID }` }
					external={ true }
					onClick={ this.handleEditSiteAddressClick }>
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

						<Property label={ this.props.translate( 'Renews on', { comment: 'The corresponding date is in a different cell in the UI, the date is not included within the translated string' } ) }>
							<em>{ this.props.translate( 'Never Expires' ) }</em>
						</Property>
					</Card>
				</div>
				{ this.getEditSiteAddressBlock() }
			</div>
		);
	}
} );

export default localize( WpcomDomain );
