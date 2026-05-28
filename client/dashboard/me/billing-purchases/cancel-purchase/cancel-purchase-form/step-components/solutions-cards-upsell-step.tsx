import { PersonalPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import { localizeUrl } from '@automattic/i18n-utils';
// eslint-disable-next-line no-restricted-imports -- Zendesk eligibility gate for speak-with-support intervention
import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import {
	Button,
	Icon,
	Spinner,
	__experimentalVStack as VStack,
	type IconType,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	brush,
	calendar,
	comment,
	commentContent,
	globe,
	people,
	percent,
	postList,
	reusableBlock,
	search,
	shipping,
	trendingUp,
	upload,
} from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import * as React from 'react';
import { useHelpCenter } from '../../../../../app/help-center';
import { ButtonStack } from '../../../../../components/button-stack';
import DashboardSummaryButton from '../../../../../components/summary-button';
import { SummaryButtonList } from '../../../../../components/summary-button-list';
import { dashboardLink, wpcomLink } from '../../../../../utils/link';
import { getSolutionsForReason, PRICE_MOTIVATED_REASONS } from '../../get-solutions-for-reason';
import UpsellStep from './upsell-step';
import type { PlanProduct, Purchase } from '@automattic/api-core';

const BUILT_BY_URL = wpcomLink( '/website-design-service/?ref=wpcom-cancel-flow' );
const RENEW_COUPON = 'DONTGO25';

const CARD_ICONS: Record< string, IconType > = {
	'change-plan': reusableBlock,
	'switch-to-monthly': calendar,
	'switch-to-yearly': calendar,
	'speak-with-support': comment,
	'renew-now-pay-less': percent,
	'built-by': people,
	'ask-ai-assistant': commentContent,
	'upgrade-for-full-access': upload,
	'get-theme-addon': brush,
	'find-guides': postList,
	'make-site-faster': trendingUp,
	'use-migration-tools': shipping,
	'use-domain-guide': globe,
	'explore-domain-options': search,
};

function getDecorationForCard( cardId: string ) {
	const icon = CARD_ICONS[ cardId ];
	if ( ! icon ) {
		return undefined;
	}
	return <Icon icon={ icon } size={ 24 } />;
}

function isAnnualOrLongerPlan( purchase: Purchase ): boolean {
	return (
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD ||
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_BIENNIAL_PERIOD ||
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_TRIENNIAL_PERIOD
	);
}

const SUPPORT_GUIDES_URL = localizeUrl( wpcomLink( '/support/' ) );
const SITE_SPEED_URL = localizeUrl( wpcomLink( '/support/site-speed/' ) );
const SITE_MIGRATION_URL = localizeUrl( wpcomLink( '/support/site-migration/' ) );
const DOMAIN_GUIDE_URL = localizeUrl( wpcomLink( '/support/domains/' ) );

function getCardHref(
	cardId: string,
	changePlanUrl: string,
	renewNowUrl: string,
	subscriptionsUrl: string | undefined,
	siteSlug: string,
	yearlyPlanUrl?: string
): string | undefined {
	if ( cardId === 'change-plan' || cardId === 'upgrade-for-full-access' ) {
		return changePlanUrl;
	}
	if ( cardId === 'renew-now-pay-less' ) {
		return renewNowUrl;
	}
	if ( cardId === 'built-by' ) {
		return BUILT_BY_URL;
	}
	if ( cardId === 'get-theme-addon' ) {
		return changePlanUrl;
	}
	if ( cardId === 'find-guides' ) {
		return SUPPORT_GUIDES_URL;
	}
	if ( cardId === 'make-site-faster' ) {
		return SITE_SPEED_URL;
	}
	if ( cardId === 'use-migration-tools' ) {
		return SITE_MIGRATION_URL;
	}
	if ( cardId === 'use-domain-guide' ) {
		return DOMAIN_GUIDE_URL;
	}
	if ( cardId === 'explore-domain-options' ) {
		return dashboardLink( `/sites/${ siteSlug }/domains` );
	}
	if ( cardId === 'switch-to-yearly' ) {
		return yearlyPlanUrl;
	}
	return undefined;
}

function getCardOnClick(
	cardId: string,
	hasAction: boolean,
	handleCardAction: ( id: string ) => void
): ( ( e: React.MouseEvent ) => void ) | ( () => void ) | undefined {
	const navCardIds = [
		'built-by',
		'change-plan',
		'renew-now-pay-less',
		'switch-to-yearly',
		'upgrade-for-full-access',
		'get-theme-addon',
		'find-guides',
		'make-site-faster',
		'use-migration-tools',
		'use-domain-guide',
		'explore-domain-options',
	];
	if ( navCardIds.includes( cardId ) ) {
		return ( e: React.MouseEvent ) => {
			e.preventDefault();
			handleCardAction( cardId );
		};
	}
	if ( hasAction ) {
		return () => handleCardAction( cardId );
	}
	return undefined;
}

function getCardTitle( cardId: string ): string {
	switch ( cardId ) {
		case 'change-plan':
			return __( 'Switch to a different plan' );
		case 'renew-now-pay-less':
			return __( 'Renew now and pay less' );
		case 'switch-to-monthly':
			return __( 'Switch to monthly payments' );
		case 'switch-to-yearly':
			return __( 'Switch to yearly billing' );
		case 'speak-with-support':
			return __( 'Speak with our support team' );
		case 'built-by':
			return __( 'Let us build for you' );
		case 'ask-ai-assistant':
			return __( 'Ask our AI assistant' );
		case 'upgrade-for-full-access':
			return __( 'Pick another paid plan for access to more features' );
		case 'get-theme-addon':
			return __( 'Change your plan' );
		case 'find-guides':
			return __( 'Find easy step-by-step guides' );
		case 'make-site-faster':
			return __( 'Make your site faster' );
		case 'use-migration-tools':
			return __( 'Use our migration tools' );
		case 'use-domain-guide':
			return __( 'Use our domain guide' );
		case 'explore-domain-options':
			return __( 'Explore more domain options' );
		default:
			return '';
	}
}

function getCardDescription( cardId: string ): string {
	switch ( cardId ) {
		case 'change-plan':
			return __( 'You can change to a plan with the features and pricing that work for you.' );
		case 'renew-now-pay-less':
			/* translators: % is the discount amount (e.g. 25%) */
			return __( 'Get an exclusive 25% discount automatically applied at checkout.' );
		case 'switch-to-monthly':
			return __( 'Keep things flexible with monthly billing.' );
		case 'switch-to-yearly':
			return __( 'Pay less over time by switching to an annual plan.' );
		case 'speak-with-support':
			return __( "We're here to answer any of your questions." );
		case 'built-by':
			return __( 'Our team can build your site so you can focus on what matters.' );
		case 'ask-ai-assistant':
			return __( 'Use our AI assistant to quickly find solutions.' );
		case 'upgrade-for-full-access':
			return __( 'Get the business plan to access all available plugins and themes.' );
		case 'get-theme-addon':
			return __( 'Unlock premium themes on another plan.' );
		case 'find-guides':
			return __( 'Browse our guides and get back on track quickly.' );
		case 'make-site-faster':
			return __( 'Run our free speed test and get personalized recommendations.' );
		case 'use-migration-tools':
			return __( 'Expert assistance or seamless importers for quick moves.' );
		case 'use-domain-guide':
			return __( 'Follow our simple guide to get connected quickly.' );
		case 'explore-domain-options':
			return __( "Our search tool finds great alternatives you'll love." );
		default:
			return '';
	}
}

type SolutionsCardsUpsellStepProps = {
	cancellationReason?: string;
	cancellationInProgress?: boolean;
	cancelBundledDomain?: boolean;
	closeDialog?: () => void;
	downgradePlan?: PlanProduct | null;
	includedDomainPurchase?: Purchase;
	intent?: string;
	onClickDowngrade?: ( upsell: string ) => void;
	onDeclineUpsell?: () => void;
	onSwitchToMonthly?: () => void;
	purchase: Purchase;
	refundAmount?: number;
	yearlyPlanSlug?: string;
};

export default function SolutionsCardsUpsellStep( {
	cancellationReason = '',
	cancellationInProgress,
	cancelBundledDomain,
	closeDialog,
	downgradePlan,
	includedDomainPurchase,
	intent,
	onClickDowngrade,
	onDeclineUpsell,
	onSwitchToMonthly,
	purchase,
	refundAmount,
	yearlyPlanSlug,
}: SolutionsCardsUpsellStepProps ) {
	const [ showDowngradeStep, setShowDowngradeStep ] = React.useState( false );
	const solutions = getSolutionsForReason( cancellationReason );
	const { setNewMessagingChat, setOpenOdieWithContext } = useHelpCenter();
	const { data: canConnectToZendeskMessaging } = useCanConnectToZendeskMessaging();

	const showSwitchToMonthly = isAnnualOrLongerPlan( purchase );

	const hideChangePlan =
		( PersonalPlans as readonly string[] ).includes( purchase.product_slug ) &&
		PRICE_MOTIVATED_REASONS.has( cancellationReason );

	const showSwitchToYearly = ! isAnnualOrLongerPlan( purchase ) && !! yearlyPlanSlug;

	const filteredSolutions = solutions?.filter( ( card ) => {
		if ( card.id === 'switch-to-monthly' && ! showSwitchToMonthly ) {
			return false;
		}
		if ( card.id === 'switch-to-yearly' && ! showSwitchToYearly ) {
			return false;
		}
		if ( card.id === 'change-plan' && hideChangePlan ) {
			return false;
		}
		return true;
	} );

	if ( ! filteredSolutions?.length ) {
		return null;
	}

	if ( showDowngradeStep ) {
		return (
			<UpsellStep
				upsell="downgrade-monthly"
				cancellationReason={ cancellationReason }
				cancellationInProgress={ cancellationInProgress }
				cancelBundledDomain={ cancelBundledDomain }
				currencyCode={ purchase.currency_code }
				downgradePlan={ downgradePlan }
				includedDomainPurchase={ includedDomainPurchase }
				onClickDowngrade={ onClickDowngrade }
				onDeclineUpsell={ () => setShowDowngradeStep( false ) }
				plans={ [] }
				purchase={ purchase }
				refundAmount={ refundAmount }
			/>
		);
	}

	const changePlanUrl = wpcomLink( `/plans/${ purchase.site_slug }` );
	const purchaseSettingsUrl = dashboardLink( '/me/billing/purchases/' + purchase.ID );
	const renewNowUrl = addQueryArgs(
		wpcomLink(
			`/checkout/${ purchase.site_slug }/${ purchase.product_slug }?coupon=${ RENEW_COUPON }`
		),
		{ redirect_to: purchaseSettingsUrl, cancel_to: purchaseSettingsUrl }
	);
	const subscriptionsUrl = wpcomLink(
		`/purchases/subscriptions/${ purchase.site_slug }/${ purchase.ID }`
	);
	const yearlyPlanUrl = yearlyPlanSlug
		? addQueryArgs( wpcomLink( `/checkout/${ purchase.site_slug }/${ yearlyPlanSlug }` ), {
				redirect_to: dashboardLink( '/me/billing/purchases' ),
				cancel_to: purchaseSettingsUrl,
		  } )
		: undefined;

	const handleCardAction = ( solutionId: string ) => {
		switch ( solutionId ) {
			case 'change-plan':
			case 'upgrade-for-full-access':
				window.location.href = changePlanUrl;
				break;
			case 'renew-now-pay-less':
				window.location.href = renewNowUrl;
				break;
			case 'switch-to-monthly':
				( document.activeElement as HTMLElement )?.blur();
				if ( onSwitchToMonthly ) {
					onSwitchToMonthly();
				} else {
					setShowDowngradeStep( true );
				}
				break;
			case 'switch-to-yearly':
				if ( yearlyPlanUrl ) {
					window.location.href = yearlyPlanUrl;
				}
				break;
			case 'speak-with-support': {
				const initialMessage =
					"User is contacting us from pre-cancellation form. Cancellation reason they've given: " +
					cancellationReason;
				if ( canConnectToZendeskMessaging ) {
					setNewMessagingChat( {
						initialMessage,
						siteUrl: purchase.site_slug,
						siteId: String( purchase.blog_id ),
					} );
				} else {
					setOpenOdieWithContext( {
						initialMessage,
						siteUrl: purchase.site_slug,
						siteId: String( purchase.blog_id ),
					} );
				}
				break;
			}
			case 'built-by':
				window.location.replace( BUILT_BY_URL );
				break;
			case 'get-theme-addon':
				window.location.href = changePlanUrl;
				break;
			case 'find-guides':
				window.open( SUPPORT_GUIDES_URL, '_blank' );
				break;
			case 'make-site-faster':
				window.open( SITE_SPEED_URL, '_blank' );
				break;
			case 'use-migration-tools':
				window.open( SITE_MIGRATION_URL, '_blank' );
				break;
			case 'use-domain-guide':
				window.open( DOMAIN_GUIDE_URL, '_blank' );
				break;
			case 'explore-domain-options':
				window.location.href = dashboardLink( `/sites/${ purchase.site_slug }/domains` );
				break;
			case 'ask-ai-assistant': {
				const initialMessage =
					"User is contacting from pre-cancellation form. Cancellation reason they've given: " +
					cancellationReason;
				setOpenOdieWithContext( {
					initialMessage,
					section: 'pre-cancellation-upsell',
					siteId: purchase.blog_id,
				} );
				closeDialog?.();
				break;
			}
			default:
				break;
		}
	};

	return (
		<VStack spacing={ 6 }>
			<SummaryButtonList
				title={
					filteredSolutions.length === 1
						? __( "Before you cancel, here's an idea:" )
						: __( 'Before canceling, you can consider these options:' )
				}
				density="medium-low"
				actions={ cancellationInProgress ? <Spinner /> : undefined }
			>
				{ filteredSolutions.map( ( card ) => {
					const hasAction = Boolean(
						card.id === 'speak-with-support' ||
							card.id === 'ask-ai-assistant' ||
							card.id === 'built-by' ||
							card.id === 'change-plan' ||
							card.id === 'renew-now-pay-less' ||
							card.id === 'switch-to-monthly' ||
							card.id === 'switch-to-yearly' ||
							card.id === 'upgrade-for-full-access' ||
							card.id === 'get-theme-addon' ||
							card.id === 'find-guides' ||
							card.id === 'make-site-faster' ||
							card.id === 'use-migration-tools' ||
							card.id === 'use-domain-guide' ||
							card.id === 'explore-domain-options'
					);
					const href = getCardHref(
						card.id,
						changePlanUrl,
						renewNowUrl,
						subscriptionsUrl,
						purchase.site_slug,
						yearlyPlanUrl
					);
					const onClick = getCardOnClick( card.id, hasAction, handleCardAction );
					const title = getCardTitle( card.id );

					return (
						<DashboardSummaryButton
							key={ card.id }
							className="cancel-purchase-form__solution-card"
							title={ title }
							description={ getCardDescription( card.id ) }
							decoration={ getDecorationForCard( card.id ) }
							href={ href }
							onClick={ onClick }
							showArrow={ hasAction }
							disabled={ cancellationInProgress }
						/>
					);
				} ) }
			</SummaryButtonList>
			<ButtonStack justify="flex-start">
				<Button
					variant="tertiary"
					isDestructive={ intent === 'remove' }
					onClick={ onDeclineUpsell }
					disabled={ cancellationInProgress }
				>
					{ intent === 'remove' ? __( 'No thanks, continue removal' ) : __( 'No, thanks' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
