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
import {
	MAP_DOMAIN_CHANGE_NAME_SERVERS,
	MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS,
} from 'calypso/lib/url/support';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { WPCOM_DEFAULT_NAMESERVERS } from 'calypso/state/domains/nameservers/constants';
import FoldableFAQ from 'calypso/components/foldable-faq';
import { Notice } from 'calypso/components/notice';

const DomainMappingDetails = ( { domain, isSubdomainMapping, isRootDomainWithUs, translate } ) => {
	if ( isSubdomainMapping && isRootDomainWithUs ) {
		return null;
	}

	const renderLinkTo = ( url ) => {
		return <a href={ url } target="_blank" rel="noopener noreferrer" />;
	};

	const primaryMessage = translate(
		'Please log into your account at your domain registrar and {{strong}}update the name servers{{/strong}} of your domain to use the following values, as detailed in {{link}}these instructions{{/link}}:',
		{
			comment: 'Notice for mapped domain notice with NS records pointing to somewhere else',
			components: {
				strong: <strong />,
				link: renderLinkTo( MAP_DOMAIN_CHANGE_NAME_SERVERS ),
			},
		}
	);

	const renderRecommendedSetupMessage = () => {
		return (
			<FoldableFAQ
				id="recommended-mapping-setup"
				question={ translate( 'Recommended setup' ) }
				expanded
			>
				<p>{ primaryMessage }</p>
				{ ! isSubdomain( domain.name ) && (
					<ul className="checkout-thank-you__name-server-list">
						{ WPCOM_DEFAULT_NAMESERVERS.map( ( nameServer ) => {
							return <li key={ nameServer }>{ nameServer }</li>;
						} ) }
					</ul>
				) }
			</FoldableFAQ>
		);
	};

	const advancedSetupUsingARecordsTitle = translate( 'Advanced setup using root A records' );
	const aRecordMappingWarning = translate(
		'If you map a domain using A records rather than WordPress.com name servers, you will need to manage your domain’s DNS records yourself for any other services you are using with your domain, including email forwarding or email hosting (i.e. with Google Workspace or Titan)'
	);
	const aRecordsSetupMessage = translate(
		'Please set the following IP addresses as root A records using {{link}}these instructions{{/link}}:',
		{
			components: { link: renderLinkTo( MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS ) },
		}
	);

	const newInstructions = (
		<div className="checkout-thank-you__main-content">
			{ renderRecommendedSetupMessage( primaryMessage ) }
			<FoldableFAQ id="advanced-mapping-setup" question={ advancedSetupUsingARecordsTitle }>
				<Notice status="is-warning" showDismiss={ false } translate={ translate }>
					{ aRecordMappingWarning }
				</Notice>
				<p>{ aRecordsSetupMessage }</p>
				<ul className="checkout-thank-you__name-server-list">
					{ /* { domain.aRecordsRequiredForMapping.map( ( aRecord ) => {
						return <li key={ aRecord }>{ aRecord }</li>;
					} ) } */ }
				</ul>
			</FoldableFAQ>
		</div>
	);

	return (
		<div className="checkout-thank-you__domain-mapping-details">
			<PurchaseDetail icon="cog" description={ newInstructions } isRequired />
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
