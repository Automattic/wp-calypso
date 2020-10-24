/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'calypso/components/purchase-detail';
import { isSubdomain } from 'calypso/lib/domains';
import { isBusiness } from 'calypso/lib/products-values';
import { MAP_EXISTING_DOMAIN, MAP_SUBDOMAIN } from 'calypso/lib/url/support';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const DomainMappingDetails = ( {
	domain,
	isBusinessPlan,
	isSubdomainMapping,
	isRootDomainWithUs,
	registrarSupportUrl,
	selectedSiteDomain,
	translate,
} ) => {
	if ( isSubdomainMapping && isRootDomainWithUs ) {
		return null;
	}

	const registrarSupportLink = registrarSupportUrl ? (
		<a target="_blank" rel="noopener noreferrer" href={ registrarSupportUrl } />
	) : (
		<span />
	);

	let instructions = (
		<div>
			<p>
				{ translate(
					'To point your domain at your WordPress.com site, log in to your ' +
						"{{registrarSupportLink}}domain provider's site{{/registrarSupportLink}} " +
						'(where you purchased the domain), and update your name servers to:',
					{
						components: {
							registrarSupportLink: registrarSupportLink,
						},
					}
				) }
			</p>
			<ul className="checkout-thank-you__domain-mapping-details-nameservers">
				<li>ns1.wordpress.com</li>
				<li>ns2.wordpress.com</li>
				<li>ns3.wordpress.com</li>
			</ul>
		</div>
	);

	if ( isSubdomainMapping ) {
		instructions = (
			<div>
				<p>
					{ translate(
						'To point your domain at your WordPress.com site, log in to your ' +
							"{{registrarSupportLink}}domain provider's site{{/registrarSupportLink}} " +
							'(where you purchased the domain), and edit the DNS records to add a CNAME record:',
						{
							components: {
								registrarSupportLink: registrarSupportLink,
							},
						}
					) }
				</p>
				<ul className="checkout-thank-you__domain-mapping-details-nameservers">
					<li>
						{ domain }. IN CNAME { selectedSiteDomain }.
					</li>
				</ul>
			</div>
		);
	}

	if ( isSubdomainMapping && isBusinessPlan ) {
		instructions = (
			<div>
				<p>
					{ translate(
						'To point your domain at your WordPress.com site, log in to your ' +
							"{{registrarSupportLink}}domain provider's site{{/registrarSupportLink}} " +
							'(where you purchased the domain), and edit the DNS records to add these NS records:',
						{
							components: {
								registrarSupportLink: registrarSupportLink,
							},
						}
					) }
				</p>
				<ul className="checkout-thank-you__domain-mapping-details-nameservers">
					<li>{ domain }. IN NS ns1.wordpress.com.</li>
					<li>{ domain }. IN NS ns2.wordpress.com.</li>
					<li>{ domain }. IN NS ns3.wordpress.com.</li>
				</ul>
			</div>
		);
	}

	const description = (
		<div>
			{ instructions }
			<p>{ translate( 'If you already did this, no further action is required.' ) }</p>
		</div>
	);

	return (
		<div className="checkout-thank-you__domain-mapping-details">
			<PurchaseDetail
				icon="cog"
				description={ description }
				buttonText={ translate( 'Learn more' ) }
				href={ isSubdomainMapping ? MAP_SUBDOMAIN : MAP_EXISTING_DOMAIN }
				target="_blank"
				rel="noopener noreferrer"
				isRequired
			/>
		</div>
	);
};

const mapStateToProps = ( state, { domain } ) => {
	const selectedSite = getSelectedSite( state );
	return {
		isBusinessPlan: isBusiness( selectedSite.plan ),
		isSubdomainMapping: isSubdomain( domain ),
		selectedSiteDomain: selectedSite.domain,
	};
};

export default connect( mapStateToProps )( localize( DomainMappingDetails ) );
