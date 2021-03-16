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
import { getSelectedDomain, isSubdomain } from 'calypso/lib/domains';
import { isBusiness } from 'calypso/lib/products-values';
import {
	MAP_DOMAIN_CHANGE_NAME_SERVERS,
	MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS,
	MAP_SUBDOMAIN,
} from 'calypso/lib/url/support';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { WPCOM_DEFAULT_NAMESERVERS } from 'calypso/state/domains/nameservers/constants';
import FoldableFAQ from 'calypso/components/foldable-faq';
import { Notice } from 'calypso/components/notice';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import ExternalLink from 'calypso/components/external-link';
import DomainMappingInstructions from 'calypso/my-sites/domains/domain-management/domain-mapping-instructions';

function renderLinkTo( url ) {
	return <ExternalLink href={ url } target="_blank" />;
}

function isDataLoaded( domains, domain ) {
	return getSelectedDomain( { domains, selectedDomainName: domain } );
}

const DomainMappingDetails = ( {
	domain,
	domains,
	isSubdomainMapping,
	isRootDomainWithUs,
	siteId,
	translate,
} ) => {
	if ( isSubdomainMapping && isRootDomainWithUs ) {
		return null;
	}

	let primaryMessage;

	if ( isSubdomainMapping ) {
		primaryMessage = translate(
			'Please create the correct CNAME or NS records at your current DNS provider. {{learnMoreLink}}Learn how to do that in our support guide for mapping subdomains{{/learnMoreLink}}.',
			{
				components: {
					learnMoreLink: renderLinkTo( MAP_SUBDOMAIN ),
				},
			}
		);
	} else {
		primaryMessage = translate(
			'Please log into your account at your domain registrar and {{strong}}update the name servers{{/strong}} of your domain to use the following values, as detailed in {{link}}these instructions{{/link}}:',
			{
				components: {
					strong: <strong />,
					link: renderLinkTo( MAP_DOMAIN_CHANGE_NAME_SERVERS ),
				},
			}
		);
	}

	const renderRecommendedSetupMessage = () => {
		return (
			<FoldableFAQ
				id="recommended-mapping-setup"
				question={ translate( 'Recommended setup' ) }
				expanded
			>
				<p>{ primaryMessage }</p>
				{ ! isSubdomain( domain ) && (
					<ul className="checkout-thank-you__name-server-list">
						{ WPCOM_DEFAULT_NAMESERVERS.map( ( nameServer ) => {
							return <li key={ nameServer }>{ nameServer }</li>;
						} ) }
					</ul>
				) }
			</FoldableFAQ>
		);
	};

	const renderARecordsList = () => {
		if ( ! isDataLoaded( domains, domain ) ) {
			return (
				<ul className="checkout-thank-you__dns-records-list-placeholder">
					<li></li>
					<li></li>
				</ul>
			);
		}
		const purchasedDomain = getSelectedDomain( { domains, selectedDomainName: domain } );
		return (
			<ul className="checkout-thank-you__dns-records-list">
				{ purchasedDomain.aRecordsRequiredForMapping.map( ( aRecord ) => {
					return <li key={ aRecord }>{ aRecord }</li>;
				} ) }
			</ul>
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

	const renderARecordsMappingMessage = () => {
		return (
			<FoldableFAQ id="advanced-mapping-setup" question={ advancedSetupUsingARecordsTitle }>
				<Notice status="is-warning" showDismiss={ false } translate={ translate }>
					{ aRecordMappingWarning }
				</Notice>
				<p>{ aRecordsSetupMessage }</p>
				{ renderARecordsList() }
			</FoldableFAQ>
		);
	};

	const purchasedDomain = getSelectedDomain( { domains, selectedDomainName: domain } );

	const renderInstructions = () => (
		<div className="checkout-thank-you__main-content">
			{ renderRecommendedSetupMessage( primaryMessage ) }
			{ purchasedDomain?.aRecordsRequiredForMapping && renderARecordsMappingMessage() }
		</div>
	);
	// TODO: Will remove, added just for the linter to stop complaining
	renderInstructions();

	const mappingInstructions = (
		<DomainMappingInstructions
			isSubdomain={ !! isSubdomainMapping }
			isLoaded={ isDataLoaded() }
			domain={ purchasedDomain }
			translate={ translate }
		/>
	);

	return (
		<div className="checkout-thank-you__domain-mapping-details">
			<QuerySiteDomains siteId={ siteId } />
			<PurchaseDetail icon="cog" description={ mappingInstructions } isRequired />
		</div>
	);
};

const mapStateToProps = ( state, { domain } ) => {
	const selectedSite = getSelectedSite( state );
	return {
		domains: getDomainsBySiteId( state, selectedSite.ID ),
		isBusinessPlan: isBusiness( selectedSite.plan ),
		isSubdomainMapping: isSubdomain( domain ),
		selectedSiteDomain: selectedSite.domain,
		siteId: selectedSite.ID,
	};
};

export default connect( mapStateToProps )( localize( DomainMappingDetails ) );
