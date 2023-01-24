import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Button, Card, Spinner } from '@automattic/components';
import { useDomainSuggestions } from '@automattic/domain-picker/src';
import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { get } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { checkDomainAvailability } from 'calypso/lib/domains';
import { domainAvailability } from 'calypso/lib/domains/constants';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const preCheckDomainAvailability = async ( domain, siteId ) => {
	return new Promise( ( resolve ) => {
		checkDomainAvailability(
			{
				domainName: domain,
				blogId: siteId,
				isCartPreCheck: true,
			},
			( error, result ) => {
				const status = get( result, 'status', error );
				const isAvailable = domainAvailability.AVAILABLE === status;
				const isAvailableSupportedPremiumDomain =
					config.isEnabled( 'domains/premium-domain-purchases' ) &&
					domainAvailability.AVAILABLE_PREMIUM === status &&
					result?.is_supported_premium_domain;
				resolve( {
					status: ! isAvailable && ! isAvailableSupportedPremiumDomain ? status : null,
					trademarkClaimsNoticeInfo: get( result, 'trademark_claims_notice_info', null ),
				} );
			}
		);
	} );
};

export default function DomainUpsell() {
	const { setDomainCartItem } = useDispatch( ONBOARD_STORE );
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSubDomain = siteSlug.split( '.' )[ 0 ];
	const locale = useLocale();
	const { allDomainSuggestions } =
		useDomainSuggestions( siteSubDomain, 3, undefined, locale ) || {};

	// Get first non-free suggested domain.
	const domainSuggestion = allDomainSuggestions?.filter(
		( suggestion ) => ! suggestion.is_free
	)[ 0 ];

	// It takes awhile to suggest a domain name. Set a default to siteSubDomain.blog.
	const domainSuggestionName = domainSuggestion?.domain_name ?? siteSubDomain + '.blog';
	const domainSuggestionProductSlug = domainSuggestion?.product_slug;

	const searchLink = '/domains/add/' + siteSlug;
	const getSearchClickHandler = () => {
		recordTracksEvent( 'calypso_my_home_domain_upsell_search_click', {
			button_url: searchLink,
			domain_suggestion: domainSuggestionName,
			product_slug: domainSuggestionProductSlug,
		} );
	};

	const purchaseLink = '/plans/' + siteSlug;
	const getCtaClickHandler = () => {
		recordTracksEvent( 'calypso_my_home_domain_upsell_cta_click', {
			button_url: purchaseLink,
			domain_suggestion: domainSuggestionName,
			product_slug: domainSuggestionProductSlug,
		} );
	};

	const onClick = () => {
		// Should show loading on button
		preCheckDomainAvailability( domainSuggestionName, siteId )
			.catch( () => [] )
			.then( () => {
				const domainCartItem = domainRegistration( {
					domain: domainSuggestion.domain_name,
					productSlug: domainSuggestion.product_slug || '',
				} );
				setDomainCartItem( domainCartItem );
			} );
	};

	return (
		<Card className="domain-upsell__card customer-home__card">
			<TrackComponentView eventName="calypso_my_home_domain_upsell_impression" />
			<div>
				<h3>{ translate( 'Own your online identity with a custom domain' ) }</h3>
				<p>
					{ translate(
						"Find the perfect domain name and stake your claim on your corner of the web with a site address that's easy to find, share, and follow."
					) }
				</p>

				<div className="suggested-domain-name">
					<div className="card">
						<span>
							<strike>{ siteSlug }</strike>
						</span>
						<div className="badge badge--info">{ translate( 'Current' ) }</div>
					</div>
					<div className="card">
						<span>{ domainSuggestionName }</span>
						{ domainSuggestion?.domain_name ? (
							<div className="badge badge--success">{ translate( 'Available' ) }</div>
						) : (
							<div className="badge">
								<Spinner />
							</div>
						) }
					</div>
				</div>

				<div className="domain-upsell-actions">
					<Button href={ searchLink } onClick={ getSearchClickHandler }>
						{ translate( 'Search a domain' ) }
					</Button>
					<Button primary href={ purchaseLink } onClick={ getCtaClickHandler }>
						{ translate( 'Get your custom domain' ) }
					</Button>
				</div>
			</div>
		</Card>
	);
}
