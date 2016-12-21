/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import PurchaseDetail from 'components/purchase-detail';
import supportUrls from 'lib/url/support';

const DomainMappingDetails = ( { domain, registrarSupportUrl, translate } ) => {
	const registrarSupportLink = registrarSupportUrl
		? <a target="_blank" rel="noopener noreferrer" href={ registrarSupportUrl } />
		: <span />;
	const description = (
		<div>
			<p>
				{
					translate( 'Your domain {{em}}%(domain)s{{/em}} has to be configured to work with WordPress.com.', {
						args: { domain },
						components: { em: <em /> }
					} )
				}
			</p>
			<p>
				{
					translate(
						'If you already did this yourself, or if the domain was already configured for you, no further action is needed.'
					)
				}
			</p>
			<p>
				{
					translate(
						'If not, you will need to log into {{registrarSupportLink}}your registrar\'s site{{/registrarSupportLink}} ' +
						'(where you purchased the domain originally) and change the "Name Servers" to:',
						{
							components: {
								registrarSupportLink: registrarSupportLink
							}
						}
					)
				}
			</p>
			<ul className="checkout-thank-you__domain-mapping-details-nameservers">
				<li>ns1.wordpress.com</li>
				<li>ns2.wordpress.com</li>
				<li>ns3.wordpress.com</li>
			</ul>
			<p>{
				translate(
					'Once you make the change, just wait a few hours and the domain should start loading your site automatically.'
				)
			}</p>
		</div>
	);

	return (
		<div className="checkout-thank-you__domain-mapping-details">
			<PurchaseDetail
				icon="cog"
				description={ description }
				buttonText={ translate( 'Learn more' ) }
				href={ supportUrls.MAP_EXISTING_DOMAIN }
				target="_blank"
				rel="noopener noreferrer"
				isRequired />
		</div>
	);
};

export default localize( DomainMappingDetails );
