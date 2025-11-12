import { useDomainSearchEscapeHatch } from '@automattic/domain-search';
import {
	isAIBuilderFlow,
	isCopySiteFlow,
	isDomainFlow,
	isDomainAndPlanFlow,
	isHundredYearDomainFlow,
	isHundredYearPlanFlow,
	isNewHostedSiteCreationFlow,
	isNewsletterFlow,
	isOnboardingFlow,
	Step,
	StepContainer,
} from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { FreeDomainForAYearPromo } from 'calypso/components/domains/wpcom-domain-search/free-domain-for-a-year-promo';
import { useQueryHandler } from 'calypso/components/domains/wpcom-domain-search/use-query-handler';
import { useWPCOMDomainSearchEvents } from 'calypso/components/domains/wpcom-domain-search/use-wpcom-domain-search-events';
import FormattedHeader from 'calypso/components/formatted-header';
import { isRelativeUrl } from 'calypso/dashboard/utils/url';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import {
	domainAddNew,
	domainManagementList,
	domainManagementRoot,
	domainManagementTransferIn,
	domainManagementTransferToOtherSite,
	domainMapping,
} from 'calypso/my-sites/domains/paths';
import { siteHasPaidPlan } from 'calypso/signup/steps/site-picker/site-picker-submit';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { hasHostingDashboardOptIn } from 'calypso/state/sites/selectors/has-hosting-dashboard-opt-in';
import { useQuery } from '../../../../hooks/use-query';
import { useSite } from '../../../../hooks/use-site';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import HundredYearPlanStepWrapper from '../hundred-year-plan-step-wrapper';
import type { Step as StepType } from '../../types';
import type { FreeDomainSuggestion } from '@automattic/api-core';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const HUNDRED_YEAR_DOMAIN_TLDS = [ 'com', 'net', 'org', 'blog' ];

import './style.scss';

type UseMyDomain = {
	navigateToUseMyDomain: true;
	siteUrl?: string;
	domainItem?: MinimalRequestCartProduct;
	lastQuery?: string;
	signupDomainOrigin?: string;
};

type StepSubmission = {
	navigateToUseMyDomain?: never;
	siteUrl?: string;
	suggestion?: {
		domain_name: string;
		is_free: boolean;
	};
	domainItem?: MinimalRequestCartProduct;
	domainCart?: MinimalRequestCartProduct[];
	signupDomainOrigin?: string;
};

const DomainSearchStep: StepType< {
	submits: UseMyDomain | StepSubmission;
} > = function DomainSearchStep( { navigation, flow } ) {
	const userSiteCount = useSelector( getCurrentUserSiteCount );
	const hostingDashboardOptIn = useSelector( hasHostingDashboardOptIn );
	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteId = useSiteIdParam();
	const initialQuery = useQuery().get( 'new' ) ?? '';
	const tldQuery = useQuery().get( 'tld' );
	const source = useQuery().get( 'source' );
	const backTo = useQuery().get( 'back_to' );
	const sourceSlug = useQuery().get( 'sourceSlug' );
	const { __ } = useI18n();

	// eslint-disable-next-line no-nested-ternary
	const currentSiteUrl = site?.URL ? site.URL : siteSlug ? `https://${ siteSlug }` : undefined;
	// eslint-disable-next-line no-nested-ternary
	const currentSiteId = site?.ID ? site.ID : siteId ? parseInt( siteId, 10 ) : undefined;

	const { query, setQuery, clearQuery } = useQueryHandler( {
		initialQuery,
		currentSiteUrl,
	} );

	const [ isLoadingExperiment, experimentVariation ] = useDomainSearchEscapeHatch();

	const config = useMemo( () => {
		const allowedTlds = tldQuery?.split( ',' ) ?? [];

		return {
			vendor: getSuggestionsVendor( {
				isSignup:
					! isDomainAndPlanFlow( flow ) && ! isCopySiteFlow( flow ) && ! isDomainFlow( flow ),
				isDomainOnly: isDomainFlow( flow ),
				flowName: flow,
			} ),
			priceRules: {
				hidePrice: isHundredYearPlanFlow( flow ),
				oneTimePrice: isHundredYearDomainFlow( flow ),
			},
			includeDotBlogSubdomain: isNewsletterFlow( flow ),
			skippable:
				! isHundredYearPlanFlow( flow ) &&
				! isHundredYearDomainFlow( flow ) &&
				! isDomainFlow( flow ) &&
				! isDomainAndPlanFlow( flow ),
			allowedTlds:
				isHundredYearPlanFlow( flow ) || isHundredYearDomainFlow( flow )
					? HUNDRED_YEAR_DOMAIN_TLDS
					: allowedTlds,
			includeOwnedDomainInSuggestions: true,
			allowsUsingOwnDomain:
				! isAIBuilderFlow( flow ) &&
				! isNewHostedSiteCreationFlow( flow ) &&
				! isHundredYearPlanFlow( flow ) &&
				( isHundredYearDomainFlow( flow ) ? !! query : true ),
		};
	}, [ flow, tldQuery, query ] );

	const analyticsEvents = useWPCOMDomainSearchEvents( {
		vendor: config.vendor,
		flowName: flow,
		analyticsSection: 'signup',
		query: query,
	} );

	const { submit } = navigation;

	const events = useMemo( () => {
		return {
			beforeAddDomainToCart: ( product: MinimalRequestCartProduct ) => {
				if ( isHundredYearDomainFlow( flow ) ) {
					return {
						...product,
						extra: {
							...product.extra,
							is_hundred_year_domain: true,
						},
						volume: 100,
					};
				}

				return product;
			},
			onQueryChange: setQuery,
			onQueryClear: clearQuery,
			onMoveDomainToSiteClick( otherSiteDomain: string, domainName: string ) {
				window.location.assign(
					domainManagementTransferToOtherSite( otherSiteDomain, domainName )
				);
			},
			onMakePrimaryAddressClick: () => {
				if ( ! siteSlug ) {
					return;
				}

				window.location.assign( domainManagementList( siteSlug ) );
			},
			onRegisterDomainClick: ( otherSiteDomain: string, domainName: string ) => {
				window.location.assign( domainAddNew( otherSiteDomain, domainName ) );
			},
			onCheckTransferStatusClick: ( domainName: string ) => {
				window.location.assign(
					siteSlug ? domainManagementTransferIn( siteSlug, domainName ) : domainManagementRoot()
				);
			},
			onMapDomainClick: ( domainName: string ) => {
				window.location.assign( domainMapping( siteSlug, domainName ) );
			},
			onExternalDomainClick: ( domainName?: string ) => {
				if ( domainName && isHundredYearDomainFlow( flow ) ) {
					return window.location.assign(
						`/setup/hundred-year-domain-transfer/domains?new=${ domainName }`
					);
				}

				submit( {
					navigateToUseMyDomain: true,
					lastQuery: domainName,
					signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN,
				} );
			},
			onContinue: ( domainCart: MinimalRequestCartProduct[] ) => {
				const domainItem = domainCart[ 0 ];

				submit( {
					siteUrl: domainItem.meta,
					domainItem,
					domainCart,
					suggestion: {
						domain_name: domainItem.meta!,
						is_free: false,
					},
					signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.CUSTOM,
				} );
			},
			onSkip: ( suggestion?: FreeDomainSuggestion ) => {
				let signupDomainOrigin = suggestion
					? SIGNUP_DOMAIN_ORIGIN.FREE
					: SIGNUP_DOMAIN_ORIGIN.CHOOSE_LATER;

				if (
					! isLoadingExperiment &&
					experimentVariation === 'treatment_paid_domain_area_skip_emphasis'
				) {
					signupDomainOrigin = SIGNUP_DOMAIN_ORIGIN.CHOOSE_LATER;
				}

				submit( {
					siteUrl: suggestion?.domain_name.replace( '.wordpress.com', '' ),
					domainItem: undefined,
					domainCart: [],
					suggestion,
					signupDomainOrigin,
				} );
			},
		};
	}, [ submit, setQuery, clearQuery, flow, siteSlug, isLoadingExperiment, experimentVariation ] );

	// For /setup flows, we want to show the free domain for a year discount for all flows
	// except if we're in a site context or in the 100-year plan or domain flow
	const isFirstDomainFreeForFirstYear = useMemo( () => {
		if ( isDomainFlow( flow ) ) {
			return ! site || ! siteHasPaidPlan( site );
		}

		if ( site || sourceSlug || isHundredYearPlanFlow( flow ) || isHundredYearDomainFlow( flow ) ) {
			return false;
		}

		return true;
	}, [ flow, site, sourceSlug ] );

	const slots = useMemo( () => {
		return {
			BeforeResults: () => {
				if ( ! isFirstDomainFreeForFirstYear ) {
					return null;
				}

				return <FreeDomainForAYearPromo />;
			},
			BeforeFullCartItems: () => {
				if ( ! isFirstDomainFreeForFirstYear ) {
					return null;
				}

				return <FreeDomainForAYearPromo textOnly />;
			},
		};
	}, [ isFirstDomainFreeForFirstYear ] );

	const headerText = useMemo( () => {
		if ( isNewsletterFlow( flow ) ) {
			return __( 'Your domain. Your identity.' );
		}

		if ( isHundredYearPlanFlow( flow ) || isHundredYearDomainFlow( flow ) ) {
			return __( 'Find the perfect domain' );
		}

		return __( 'Claim your space on the web' );
	}, [ flow, __ ] );

	const subHeaderText = useMemo( () => {
		if ( isNewsletterFlow( flow ) ) {
			return __( 'Make your newsletter stand out with a custom domain.' );
		}

		if ( isCopySiteFlow( flow ) ) {
			return __( 'Make your copied site unique with a custom domain all of its own.' );
		}
		if ( isHundredYearPlanFlow( flow ) || isHundredYearDomainFlow( flow ) ) {
			return __( 'Secure your 100-Year domain and start building your legacy.' );
		}

		return __( 'Make it yours with a .com, .blog, or one of 350+ domain options.' );
	}, [ flow, __ ] );

	const domainSearchElement = (
		<WPCOMDomainSearch
			className={
				shouldUseStepContainerV2( flow )
					? 'domain-search--step-container-v2'
					: 'domain-search--step-container'
			}
			currentSiteId={ currentSiteId }
			currentSiteUrl={ currentSiteUrl }
			flowName={ flow }
			config={ config }
			query={ query }
			isFirstDomainFreeForFirstYear={ isFirstDomainFreeForFirstYear }
			events={ events }
			flowAllowsMultipleDomainsInCart={
				isOnboardingFlow( flow ) ||
				isDomainFlow( flow ) ||
				isNewHostedSiteCreationFlow( flow ) ||
				isDomainAndPlanFlow( flow )
			}
			slots={ slots }
			analyticsSection="signup"
		/>
	);

	const [ sitesBackLabelText, defaultBackUrl ] =
		userSiteCount === 1
			? [ __( 'Back to My Home' ), '/home' ]
			: [ __( 'Back to sites' ), hostingDashboardOptIn ? '/v2/sites' : '/sites' ];

	if ( isHundredYearDomainFlow( flow ) || isHundredYearPlanFlow( flow ) ) {
		return (
			<HundredYearPlanStepWrapper
				stepName="domains"
				flowName={ flow as string }
				stepContent={ <div className="domains__content">{ domainSearchElement }</div> }
				formattedHeader={
					<FormattedHeader
						id="domains-header"
						align="center"
						headerText={ headerText }
						subHeaderText={ subHeaderText }
					/>
				}
			/>
		);
	}

	if ( shouldUseStepContainerV2( flow ) ) {
		const getTopBarLeftElement = () => {
			if ( isNewHostedSiteCreationFlow( flow ) ) {
				return;
			}

			let backDestination: string | typeof navigation.goBack = '';
			let backLabelText = '';

			if ( 'site' === source && site?.URL ) {
				backDestination = site.URL;
				backLabelText = __( 'Back to My Site' );
			} else if ( 'my-home' === source && siteSlug ) {
				backDestination = `/home/${ siteSlug }`;
				backLabelText = __( 'Back to My Home' );
			} else if ( 'general-settings' === source && siteSlug ) {
				backDestination = `/settings/general/${ siteSlug }`;
				backLabelText = __( 'Back to General Settings' );
			} else if ( ! isOnboardingFlow( flow ) && navigation.goBack ) {
				backDestination = navigation.goBack;
				backLabelText = __( 'Back' );
			} else {
				backDestination = defaultBackUrl;
				backLabelText = sitesBackLabelText;

				if ( backTo && isRelativeUrl( backTo ) ) {
					backDestination = backTo;
					backLabelText = __( 'Back' );
				}
			}

			return (
				<Step.BackButton
					href={ typeof backDestination === 'string' ? backDestination : undefined }
					onClick={ typeof backDestination === 'function' ? backDestination : undefined }
				>
					{ backLabelText }
				</Step.BackButton>
			);
		};

		const getTopBarRightElement = () => {
			if ( ! query ) {
				return;
			}

			return (
				<>
					{ config.allowsUsingOwnDomain && (
						<Step.LinkButton onClick={ () => events.onExternalDomainClick( query ) }>
							{ __( 'Use a domain I already own' ) }
						</Step.LinkButton>
					) }

					{ ! isLoadingExperiment &&
						experimentVariation === 'treatment_paid_domain_area_free_emphasis_extra_cta' && (
							<Step.LinkButton
								onClick={ () => {
									analyticsEvents.onSkip?.();
									events.onSkip();
								} }
							>
								{ __( 'Skip this step' ) }
							</Step.LinkButton>
						) }
				</>
			);
		};

		return (
			<Step.CenteredColumnLayout
				topBar={
					<Step.TopBar
						leftElement={ getTopBarLeftElement() }
						rightElement={ getTopBarRightElement() }
					/>
				}
				columnWidth={ 10 }
				className="step-container-v2--domain-search"
				heading={ <Step.Heading text={ headerText } subText={ subHeaderText } /> }
			>
				{ domainSearchElement }
			</Step.CenteredColumnLayout>
		);
	}

	const getBackButton = () => {
		if ( isAIBuilderFlow( flow ) ) {
			return {
				backUrl: `${ site?.URL }/wp-admin/site-editor.php?canvas=edit&referrer=${ flow }&p=%2F&ai-step=edit`,
				backLabelText: __( 'Keep Editing' ),
			};
		}

		if ( isCopySiteFlow( flow ) ) {
			return {
				backUrl: defaultBackUrl,
				backLabelText: sitesBackLabelText,
			};
		}

		if ( isDomainAndPlanFlow( flow ) || isNewsletterFlow( flow ) ) {
			return {
				goBack: navigation.goBack,
			};
		}

		return {};
	};

	const getSkipButton = () => {
		if ( ! query || ! config.allowsUsingOwnDomain ) {
			return;
		}

		return (
			<Button
				className="step-container__navigation-link forward"
				onClick={ () => events.onExternalDomainClick( query ) }
				variant="link"
			>
				<span>{ __( 'Use a domain I already own' ) }</span>
			</Button>
		);
	};

	return (
		<StepContainer
			stepName="step-container--domain-search"
			isWideLayout
			flowName={ flow }
			formattedHeader={
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />
			}
			stepContent={ domainSearchElement }
			recordTracksEvent={ recordTracksEvent }
			{ ...getBackButton() }
			customizedActionButtons={ getSkipButton() }
		/>
	);
};

export default DomainSearchStep;
