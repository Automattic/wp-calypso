import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { stringify } from 'qs';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import Main from 'calypso/components/main';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	hasEmailForwards,
	getDomainsWithEmailForwards,
} from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteSupportedDomain } from 'calypso/lib/gsuite';
import { GOOGLE_WORKSPACE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import EmailExistingForwardsNotice from 'calypso/my-sites/email/email-existing-forwards-notice';
import EmailExistingPaidServiceNotice from 'calypso/my-sites/email/email-existing-paid-service-notice';
import { BillingIntervalToggle } from 'calypso/my-sites/email/email-providers-comparison/billing-interval-toggle';
import EmailForwardingLink from 'calypso/my-sites/email/email-providers-comparison/email-forwarding-link';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import EmailUpsellNavigation from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/email-upsell-navigation';
import GoogleWorkspaceCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/google-workspace-card';
import ProfessionalEmailCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/professional-email-card';
import { emailManagementInDepthComparison } from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

export type EmailProvidersStackedComparisonProps = {
	cartDomainName?: string;
	comparisonContext: string;
	isDomainInCart?: boolean;
	selectedDomainName: string;
	selectedEmailProviderSlug?: string;
	selectedIntervalLength?: IntervalLength;
	source: string;
};

const EmailProvidersStackedComparison = ( {
	comparisonContext,
	isDomainInCart = false,
	selectedDomainName,
	selectedEmailProviderSlug,
	selectedIntervalLength = IntervalLength.ANNUALLY,
	source,
}: EmailProvidersStackedComparisonProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const currentRoute = useSelector( getCurrentRoute );

	const selectedSite = useSelector( getSelectedSite );

	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const domain = getSelectedDomain( {
		domains,
		selectedDomainName: selectedDomainName,
	} );
	const domainsWithForwards = getDomainsWithEmailForwards( domains );

	const canPurchaseGSuite = useSelector( canUserPurchaseGSuite );

	const gSuiteProduct = useSelector( ( state ) =>
		getProductBySlug(
			state,
			selectedIntervalLength === IntervalLength.MONTHLY
				? GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY
				: GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
		)
	);

	const isGSuiteSupported =
		domain && canPurchaseGSuite && ( isDomainInCart || hasGSuiteSupportedDomain( [ domain ] ) );

	const shouldPromoteGoogleWorkspace = isGSuiteSupported && source === 'google-sale';

	const [ detailsExpanded, setDetailsExpanded ] = useState( () => {
		const hasDiscountForGSuite = hasDiscount( gSuiteProduct );

		if ( shouldPromoteGoogleWorkspace && ! selectedEmailProviderSlug && hasDiscountForGSuite ) {
			return {
				google: true,
				titan: false,
			};
		}

		if ( selectedEmailProviderSlug === GOOGLE_WORKSPACE_PRODUCT_TYPE ) {
			return {
				titan: false,
				google: true,
			};
		}

		return {
			titan: true,
			google: false,
		};
	} );

	const changeExpandedState = ( providerKey: string, isCurrentlyExpanded: boolean ) => {
		const expandedEntries = Object.entries( detailsExpanded ).map( ( entry ) => {
			const [ key, currentExpanded ] = entry;

			if ( isCurrentlyExpanded ) {
				return [ key, key === providerKey ];
			}

			return [ key, key === providerKey ? isCurrentlyExpanded : currentExpanded ];
		} );

		if ( isCurrentlyExpanded ) {
			dispatch(
				recordTracksEvent( 'calypso_email_providers_expand_section_click', {
					provider: providerKey,
				} )
			);
		}

		setDetailsExpanded( Object.fromEntries( expandedEntries ) );
	};

	const changeIntervalLength = ( newIntervalLength: IntervalLength ) => {
		if ( ! selectedSite?.slug ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_email_providers_billing_interval_toggle_click', {
				current_route: currentRoute,
				domain_name: selectedDomainName,
				new_interval: newIntervalLength,
			} )
		);

		const queryString = stringify( {
			interval: newIntervalLength,
			provider: selectedEmailProviderSlug,
			source,
		} );
		page( `${ currentRoute }?${ queryString }` );
	};

	const handleCompareClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_email_providers_compare_link_click', {
				domain_name: selectedDomainName,
				interval: selectedIntervalLength,
				source,
			} )
		);
	};

	if ( ! domain && ! isDomainInCart ) {
		return null;
	}

	const hasExistingEmailForwards = ! isDomainInCart && hasEmailForwards( domain );

	const emailProviderCards = [
		<ProfessionalEmailCard
			comparisonContext={ comparisonContext }
			detailsExpanded={ detailsExpanded.titan }
			intervalLength={ selectedIntervalLength }
			isDomainInCart={ isDomainInCart }
			key={ 'ProfessionalEmailCard' }
			onExpandedChange={ changeExpandedState }
			selectedDomainName={ selectedDomainName }
			source={ source }
		/>,
		<GoogleWorkspaceCard
			comparisonContext={ comparisonContext }
			detailsExpanded={ detailsExpanded.google }
			intervalLength={ selectedIntervalLength }
			isDomainInCart={ isDomainInCart }
			key={ 'GoogleWorkspaceCard' }
			onExpandedChange={ changeExpandedState }
			selectedDomainName={ selectedDomainName }
			source={ source }
		/>,
	];

	return (
		<Main wideLayout>
			<QueryProductsList />

			{ ! isDomainInCart && selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }
			{ isDomainInCart && <EmailUpsellNavigation siteSlug={ selectedSite?.slug ?? '' } /> }

			<h1 className="email-providers-stacked-comparison__header">
				{ translate( 'Pick an email solution' ) }
			</h1>

			{ selectedSite && (
				<div className="email-providers-stacked-comparison__sub-header">
					{ translate( 'Not sure where to start? {{a}}See how they compare{{/a}}.', {
						components: {
							a: (
								<a
									href={ emailManagementInDepthComparison(
										selectedSite.slug,
										selectedDomainName,
										currentRoute,
										source,
										selectedIntervalLength
									) }
									onClick={ handleCompareClick }
								/>
							),
						},
					} ) }
				</div>
			) }

			<BillingIntervalToggle
				intervalLength={ selectedIntervalLength }
				onIntervalChange={ changeIntervalLength }
			/>

			{ hasExistingEmailForwards && domainsWithForwards?.length && (
				<EmailExistingForwardsNotice
					domainsWithForwards={ domainsWithForwards }
					selectedDomainName={ selectedDomainName }
				/>
			) }

			{ ! isDomainInCart && domain && <EmailExistingPaidServiceNotice domain={ domain } /> }

			<>
				{ shouldPromoteGoogleWorkspace ? [ ...emailProviderCards ].reverse() : emailProviderCards }
			</>

			{ ! isDomainInCart && <EmailForwardingLink selectedDomainName={ selectedDomainName } /> }

			<TrackComponentView
				eventName="calypso_email_providers_comparison_page_view"
				eventProperties={ {
					context: comparisonContext,
					interval: selectedIntervalLength,
					layout: 'stacked',
					provider: selectedEmailProviderSlug,
					source,
				} }
			/>
		</Main>
	);
};

export default EmailProvidersStackedComparison;
