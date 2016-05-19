/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import supportUrls from 'lib/url/support';

const DomainMappingDetails = ( { domain, registrarSupportUrl } ) => {
	const registrarSupportLink = registrarSupportUrl ? <a target="_blank" href={ registrarSupportUrl } /> : <span />;
	const description = (
		<div>
			<p>
				{
					i18n.translate( 'The domain {{em}}%(domain)s{{/em}} still has to be configured to work with WordPress.com.', {
						args: { domain },
						components: { em: <em /> }
					} )
				}
			</p>
			<p>
				{
					i18n.translate(
						'You will need to log into {{registrarSupportLink}}your registrar\'s site{{/registrarSupportLink}} ' +
						'and change the "Name Servers" to:',
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
			<p>{ i18n.translate( 'Once you make the change, just wait a few hours and the domain should start loading your site automatically.' ) }</p>
		</div>
	);

	return (
		<div className="checkout-thank-you__domain-mapping-details">
			<PurchaseDetail
				icon="cog"
				title={ i18n.translate( 'Finish setting up your domain' ) }
				description={ description }
				buttonText={ i18n.translate( 'Learn more' ) }
				href={ supportUrls.MAP_EXISTING_DOMAIN }
				target="_blank"
				requiredText={ i18n.translate( 'Almost done! One step remaining…' ) }
				isRequired />
		</div>
	);
};

export default DomainMappingDetails;
