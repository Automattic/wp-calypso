/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import Card from 'components/card/compact';
import Header from './card/header';
import Property from './card/property';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';

const WpcomDomain = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'edit' ) ],

	handleEditSiteAddressClick() {
		this.recordEvent( 'navigationClick', 'Edit Site Address', this.props.domain );
	},

	render() {
		return (
			<div>
				<div className="domain-details-card">
					<Header { ...this.props } />

					<Card>
						<Property label={ this.translate( 'Type', { context: 'A type of domain.' } ) }>
							{ this.translate( 'Included with Site' ) }
						</Property>

						<Property label={ this.translate( 'Renews on' ) }>
							<em>{ this.translate( 'Never Expires' ) }</em>
						</Property>
					</Card>
				</div>

				<VerticalNav>
					<VerticalNavItem
						path={ `https://${ this.props.domain.name }/wp-admin/index.php?page=my-blogs#blog_row_${ this.props.selectedSite.ID }` }
						external={ true }
						onClick={ this.handleEditSiteAddressClick }>
						{ this.translate( 'Edit Site Address' ) }
					</VerticalNavItem>
				</VerticalNav>
			</div>
		);
	}
} );

export default WpcomDomain;
