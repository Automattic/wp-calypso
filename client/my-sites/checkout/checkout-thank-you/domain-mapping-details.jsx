/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import { isSubdomain } from 'lib/domains';
import { isBusiness } from 'lib/products-values';
import { MAP_EXISTING_DOMAIN, MAP_SUBDOMAIN } from 'lib/url/support';
import { getSelectedSite } from 'state/ui/selectors';

const DomainMappingDetails = ( {
	domain,
	isBusinessPlan,
	isSubdomainMapping,
	registrarSupportUrl,
	selectedSiteDomain,
	translate,
} ) => {
	const registrarSupportLink = registrarSupportUrl ? (
		<a target="_blank" rel="noopener noreferrer" href={ registrarSupportUrl } />
	) : (
		<span />
	);

	const domainInstructions = (
		<div>
			<p>
				{ translate(
					"If not, you will need to log into {{registrarSupportLink}}your registrar's site{{/registrarSupportLink}} " +
						'(where you purchased the domain originally) and change the "Name Servers" to:',
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

	const subdomainInstructions = (
		<div>
			<p>
				{ translate(
					"If not, you will need to log into {{registrarSupportLink}}your registrar's site{{/registrarSupportLink}} " +
						'(where you purchased the domain originally) and add the following "CNAME" record:',
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

	const subdomainInstructionsBusiness = (
		<div>
			<p>
				{ translate(
					"If not, you will need to log into {{registrarSupportLink}}your registrar's site{{/registrarSupportLink}} " +
						'(where you purchased the domain originally) and add the following "NS" records:',
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

	const description = (
		<div>
			<p>
				{ translate(
					'Your domain {{em}}%(domain)s{{/em}} has to be configured to work with WordPress.com.',
					{
						args: { domain },
						components: { em: <em /> },
					}
				) }
			</p>
			<p>
				{ translate(
					'If you already did this yourself, or if the domain was already configured for you, no further action is needed.'
				) }
			</p>
			{ ! isSubdomainMapping && domainInstructions }
			{ isSubdomainMapping && ! isBusinessPlan && subdomainInstructions }
			{ isSubdomainMapping && isBusinessPlan && subdomainInstructionsBusiness }
			<p>
				{ translate(
					'Once you make the change, just wait a few hours and the domain should start loading your site automatically.'
				) }
			</p>
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
