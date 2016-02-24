/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { getDomainManagementUrl } from './utils';
import { getPrimaryDomain, isSubdomain } from 'lib/domains';
import { isPlan } from 'lib/products-values';
import PurchaseDetail from './purchase-detail';

export default React.createClass( {
	getInitialState: function() {
		return {
			primaryDomain: null
		};
	},

	componentWillMount: function() {
		getPrimaryDomain( this.props.selectedSite.ID, ( error, data ) => {
			if ( ! error && data ) {
				this.setState( { primaryDomain: data.domain } );
			}
		} );
	},

	render: function() {
		let primaryDomainDescription,
			supportDoc;

		if ( isSubdomain( this.props.domain ) ) {
			supportDoc = 'https://support.wordpress.com/domains/map-subdomain/';
		} else {
			supportDoc = 'https://support.wordpress.com/domains/map-existing-domain/';
		}

		if ( this.state.primaryDomain === this.props.domain ) {
			primaryDomainDescription = this.translate( '%(domain)s is your primary domain. Do you want to change it?', { args: { domain: this.props.domain } } );
		} else {
			primaryDomainDescription = this.translate( 'Want this to be your primary domain for this site?' );
		}

		return (
			<div>
				<PurchaseDetail
					additionalClass="important"
					title={ this.translate( 'Important!' ) }
					description={ this.translate( "Your domain mapping won't work until you update the DNS settings." ) }
					buttonText={ this.translate( 'Learn More' ) }
					href={ supportDoc }
					target="_blank" />

				<PurchaseDetail
					additionalClass="your-primary-domain"
					title={ this.translate( 'Your Primary Domain' ) }
					description={ primaryDomainDescription }
					buttonText={ this.translate( 'Update Settings' ) }
					href={ getDomainManagementUrl( this.props.selectedSite, this.props.domain ) } />

				{ ! isPlan( this.props.selectedSite.plan ) ? <PurchaseDetail
					additionalClass="upgrade-now"
					title={ this.translate( 'Upgrade Now' ) }
					description={ this.translate( 'Take your blog to the next level by upgrading to one of our plans.' ) }
					buttonText={ this.translate( 'View Plans' ) }
					href={ '/plans/' + this.props.selectedSite.slug } /> : null }
			</div>
		);
	}
} );
