/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import PurchaseDetail from 'components/purchase-detail';

const DomainMappingDetails = ( { domain } ) => {
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
			<p>{ i18n.translate( 'You will need to log into your registrar\'s site and change the "Name Servers" to:' ) }</p>
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
				href="//support.wordpress.com/map-existing-domain/"
				target="_blank"
				requiredText={ i18n.translate( 'Almost done! One step remaining…' ) }
				isRequired />
		</div>
	);
};

export default DomainMappingDetails;
