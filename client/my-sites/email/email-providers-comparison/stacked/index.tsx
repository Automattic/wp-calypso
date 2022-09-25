/* eslint-disable wpcalypso/jsx-classname-namespace */

import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
} from '@automattic/calypso-products';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { stringify } from 'qs';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDomainOwnerUserName } from 'calypso/components/data/query-domain-owner-username';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import Main from 'calypso/components/main';
import PromoCard from 'calypso/components/promo-section/promo-card';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { getSelectedDomain, canCurrentUserAddEmail } from 'calypso/lib/domains';
import {
	hasEmailForwards,
	getDomainsWithEmailForwards,
} from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteSupportedDomain } from 'calypso/lib/gsuite';
import { GOOGLE_WORKSPACE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import { domainAddNew } from 'calypso/my-sites/domains/paths';
import EmailExistingForwardsNotice from 'calypso/my-sites/email/email-existing-forwards-notice';
import EmailExistingPaidServiceNotice from 'calypso/my-sites/email/email-existing-paid-service-notice';
import { BillingIntervalToggle } from 'calypso/my-sites/email/email-providers-comparison/billing-interval-toggle';
import EmailForwardingLink from 'calypso/my-sites/email/email-providers-comparison/email-forwarding-link';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import EmailUpsellNavigation from 'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/email-upsell-navigation';
import GoogleWorkspaceCard from 'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/google-workspace-card';
import ProfessionalEmailCard from 'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/professional-email-card';
import {
	emailManagement,
	emailManagementInDepthComparison,
	loginUrlWithUserNameAndRedirectToEmailProvidersComparison,
} from 'calypso/my-sites/email/paths';
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
	hideNavigation?: boolean;
	isDomainInCart?: boolean;
	selectedDomainName: string;
	selectedEmailProviderSlug?: string;
	selectedIntervalLength?: IntervalLength;
	source: string;
};

const EmailProvidersStackedComparison = ( {
	comparisonContext,
	hideNavigation = false,
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

	const currentUserCanAddEmail = canCurrentUserAddEmail( domain );

	const ownerUserName = useDomainOwnerUserName( selectedSite, domain );

	const isPrivacyAvailable = domain?.privacyAvailable;

	const contactOwnerUrl = `https://privatewho.is/?s=${ selectedDomainName }`;

	const loginUrl = loginUrlWithUserNameAndRedirectToEmailProvidersComparison(
		ownerUserName,
		selectedSite?.slug,
		selectedDomainName
	);

	/**
	 * This function builds the event 'calypso_email_providers_owner_contact_click'
	 * or 'calypso_email_providers_user_login_click' depending on the event type passed as parameter.
	 *
	 * @param { "owner_contact" | "user_login" } eventType
	 */
	const onClickLink = ( eventType: 'owner_contact' | 'user_login' ) => {
		dispatch(
			recordTracksEvent( `calypso_email_providers_${ eventType }_click`, {
				owner_login: ownerUserName,
			} )
		);
	};

	const isGSuiteSupported =
		domain && canPurchaseGSuite && ( isDomainInCart || hasGSuiteSupportedDomain( [ domain ] ) );

	const shouldPromoteGoogleWorkspace = isGSuiteSupported && hasDiscount( gSuiteProduct );

	const [ detailsExpanded, setDetailsExpanded ] = useState( () => {
		if ( ! currentUserCanAddEmail ) {
			return {
				google: false,
				titan: false,
			};
		}

		if ( shouldPromoteGoogleWorkspace && ! selectedEmailProviderSlug ) {
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
			key="ProfessionalEmailCard"
			onExpandedChange={ currentUserCanAddEmail ? changeExpandedState : undefined }
			selectedDomainName={ selectedDomainName }
			source={ source }
		/>,
		<GoogleWorkspaceCard
			comparisonContext={ comparisonContext }
			detailsExpanded={ detailsExpanded.google }
			intervalLength={ selectedIntervalLength }
			isDomainInCart={ isDomainInCart }
			key="GoogleWorkspaceCard"
			onExpandedChange={ currentUserCanAddEmail ? changeExpandedState : undefined }
			selectedDomainName={ selectedDomainName }
			source={ source }
		/>,
	];

	const comparisonComponents = {
		a: (
			<a
				href={ emailManagementInDepthComparison(
					selectedSite?.slug ?? '',
					selectedDomainName,
					currentRoute,
					source,
					selectedIntervalLength
				) }
				onClick={ handleCompareClick }
			/>
		),
	};

	return (
		<Main
			className={ classnames( {
				'email-providers-stacked-comparison__main--domain-upsell': isDomainInCart,
			} ) }
			wideLayout
		>
			<QueryProductsList />

			{ ! isDomainInCart && selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			{ ! hideNavigation && (
				<EmailUpsellNavigation
					backUrl={
						isDomainInCart
							? domainAddNew( selectedSite?.slug )
							: emailManagement( selectedSite?.slug, null )
					}
					skipUrl={ isDomainInCart ? `/checkout/${ selectedSite?.slug }` : '' }
				/>
			) }

			<h1 className="email-providers-stacked-comparison__header">
				{ isDomainInCart
					? translate( 'Add a professional email address to %(domainName)s', {
							args: { domainName: selectedDomainName },
					  } )
					: translate( 'Pick an email solution' ) }
			</h1>

			{ selectedSite && (
				<div className="email-providers-stacked-comparison__sub-header">
					{ isDomainInCart
						? translate(
								'Build an online presence and build your brand with one of these options ({{a}}see how they compare{{/a}}).',
								{
									components: comparisonComponents,
								}
						  )
						: translate( 'Not sure where to start? {{a}}See how they compare{{/a}}.', {
								components: comparisonComponents,
						  } ) }
				</div>
			) }

			{ currentUserCanAddEmail && (
				<BillingIntervalToggle
					intervalLength={ selectedIntervalLength }
					onIntervalChange={ changeIntervalLength }
				/>
			) }

			{ hasExistingEmailForwards && domainsWithForwards?.length && (
				<EmailExistingForwardsNotice
					domainsWithForwards={ domainsWithForwards }
					selectedDomainName={ selectedDomainName }
				/>
			) }

			{ ! isDomainInCart && domain && <EmailExistingPaidServiceNotice domain={ domain } /> }

			<>
				{ ! currentUserCanAddEmail && (
					<PromoCard className="email-providers-stacked-comparison__non-owner-notice">
						<p>
							{ translate(
								'An email solution can only be purchased by the domain owner. ' +
									'To make a purchase, please {{link}}log in{{/link}} with the account that purchased the domain. ' +
									"If you don't have access to that account, please reach out to the domain owner {{reachOutLink}}%(ownerUserName)s{{/reachOutLink}}",
								{
									components: {
										link: <a href={ loginUrl } onClick={ () => onClickLink( 'user_login' ) } />,
										reachOutLink: isPrivacyAvailable ? (
											<a
												href={ contactOwnerUrl }
												onClick={ () => onClickLink( 'owner_contact' ) }
												rel="noopener noreferrer"
												target="_blank"
											/>
										) : (
											<></>
										),
									},
									args: {
										ownerUserName,
									},
								}
							) }
						</p>
					</PromoCard>
				) }
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
