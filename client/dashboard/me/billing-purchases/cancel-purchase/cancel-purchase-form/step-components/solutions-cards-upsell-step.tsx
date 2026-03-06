import { SubscriptionBillPeriod } from '@automattic/api-core';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button, Icon, __experimentalVStack as VStack, type IconType } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	brush,
	calendar,
	code,
	comment,
	commentContent,
	globe,
	people,
	percent,
	postList,
	reusableBlock,
	search,
	shipping,
	shuffle,
	trendingUp,
	upload,
} from '@wordpress/icons';
import * as React from 'react';
import { useHelpCenter } from '../../../../../app/help-center';
import DashboardSummaryButton from '../../../../../components/summary-button';
import { SummaryButtonList } from '../../../../../components/summary-button-list';
import { wpcomLink } from '../../../../../utils/link';
import { getSolutionsForReason } from '../../get-solutions-for-reason';
import type { Purchase } from '@automattic/api-core';

const BUILT_BY_URL = wpcomLink( '/website-design-service/?ref=wpcom-cancel-flow' );
const RENEW_COUPON = 'biz25';

const CARD_ICONS: Record< string, IconType > = {
	'change-plan': reusableBlock,
	'switch-to-monthly': calendar,
	'speak-with-support': comment,
	'renew-now-pay-less': percent,
	'built-by': people,
	'ask-ai-assistant': commentContent,
	'upgrade-for-full-access': upload,
	'get-theme-addon': brush,
	'get-css-addon': code,
	'find-guides': postList,
	'make-site-faster': trendingUp,
	'use-migration-tools': shipping,
	'use-domain-guide': globe,
	'explore-domain-options': search,
	'move-subscription': shuffle,
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
const DOMAINS_EXPLORE_URL = localizeUrl( wpcomLink( '/domains/' ) );

function getCardHref(
	cardId: string,
	changePlanUrl: string,
	renewNowUrl: string,
	subscriptionsUrl?: string
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
	if ( cardId === 'get-theme-addon' || cardId === 'get-css-addon' ) {
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
		return DOMAINS_EXPLORE_URL;
	}
	if ( cardId === 'move-subscription' && subscriptionsUrl ) {
		return subscriptionsUrl;
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
		'upgrade-for-full-access',
		'get-theme-addon',
		'get-css-addon',
		'find-guides',
		'make-site-faster',
		'use-migration-tools',
		'use-domain-guide',
		'explore-domain-options',
		'move-subscription',
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
			return __( 'Change plan' );
		case 'renew-now-pay-less':
			return __( 'Renew now and pay less' );
		case 'switch-to-monthly':
			return __( 'Switch to monthly payments' );
		case 'speak-with-support':
			return __( 'Speak with our support team' );
		case 'built-by':
			return __( 'Let us build for you' );
		case 'ask-ai-assistant':
			return __( 'Ask our AI assistant' );
		case 'upgrade-for-full-access':
			return __( 'Upgrade for full access' );
		case 'get-theme-addon':
			return __( 'Get our theme add-on' );
		case 'get-css-addon':
			return __( 'Get our CSS add-on' );
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
		case 'move-subscription':
			return __( 'Move your subscription' );
		default:
			return '';
	}
}

function getCardDescription( cardId: string ): string {
	switch ( cardId ) {
		case 'change-plan':
			return __( 'Find a plan that better suits your needs.' );
		case 'renew-now-pay-less':
			/* translators: % is the discount amount (e.g. 25%) */
			return __( 'Get an exclusive 25% discount automatically applied at checkout.' );
		case 'switch-to-monthly':
			return __( 'Keep things flexible with monthly billing.' );
		case 'speak-with-support':
			return __( "We're here to answer any of your questions." );
		case 'built-by':
			return __( 'Our team can build your site so you can focus on what matters.' );
		case 'ask-ai-assistant':
			return __( 'Use our AI assistant to quickly find solutions.' );
		case 'upgrade-for-full-access':
			return __( 'Get the business plan to access all available plugins and themes.' );
		case 'get-theme-addon':
			return __( 'Unlock premium themes with a simple add-on.' );
		case 'get-css-addon':
			return __( 'Customize every design detail with a simple add-on.' );
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
		case 'move-subscription':
			return __( 'Transfer your subscription to another site you own.' );
		default:
			return '';
	}
}

type SolutionsCardsUpsellStepProps = {
	cancellationReason?: string;
	cancellationInProgress?: boolean;
	closeDialog?: () => void;
	onClickDowngrade?: ( upsell: string ) => void;
	onDeclineUpsell?: () => void;
	purchase: Purchase;
};

export default function SolutionsCardsUpsellStep( {
	cancellationReason = '',
	cancellationInProgress,
	closeDialog,
	onClickDowngrade,
	onDeclineUpsell,
	purchase,
}: SolutionsCardsUpsellStepProps ) {
	const solutions = getSolutionsForReason( cancellationReason );
	const { setSubject, setShowHelpCenter } = useHelpCenter();

	const showSwitchToMonthly = isAnnualOrLongerPlan( purchase );
	const filteredSolutions = solutions?.filter(
		( card ) => card.id !== 'switch-to-monthly' || showSwitchToMonthly
	);

	if ( ! filteredSolutions?.length ) {
		return null;
	}

	const changePlanUrl = wpcomLink( `/plans/${ purchase.site_slug }` );
	const renewNowUrl = wpcomLink(
		`/checkout/${ purchase.site_slug }/${ purchase.product_slug }?coupon=${ RENEW_COUPON }`
	);
	const subscriptionsUrl = wpcomLink(
		`/purchases/subscriptions/${ purchase.site_slug }/${ purchase.ID }`
	);

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
				onClickDowngrade?.( 'downgrade-monthly' );
				break;
			case 'speak-with-support': {
				const initialMessage =
					"User is contacting us from pre-cancellation form. Cancellation reason they've given: " +
					cancellationReason;
				setSubject( initialMessage );
				setShowHelpCenter( true );
				closeDialog?.();
				break;
			}
			case 'built-by':
				window.location.replace( BUILT_BY_URL );
				break;
			case 'get-theme-addon':
			case 'get-css-addon':
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
				window.open( DOMAINS_EXPLORE_URL, '_blank' );
				break;
			case 'move-subscription':
				window.location.href = subscriptionsUrl;
				break;
			case 'ask-ai-assistant':
				// No CTA yet – card is label-only
				break;
			default:
				break;
		}
	};

	return (
		<VStack spacing={ 6 }>
			<SummaryButtonList title={ __( 'Have you tried any of these options?' ) } density="low">
				{ filteredSolutions.map( ( card ) => {
					const hasAction = Boolean(
						card.id !== 'ask-ai-assistant' &&
							( card.id === 'speak-with-support' ||
								card.id === 'built-by' ||
								card.id === 'change-plan' ||
								card.id === 'renew-now-pay-less' ||
								card.id === 'upgrade-for-full-access' ||
								card.id === 'get-theme-addon' ||
								card.id === 'get-css-addon' ||
								card.id === 'find-guides' ||
								card.id === 'make-site-faster' ||
								card.id === 'use-migration-tools' ||
								card.id === 'use-domain-guide' ||
								card.id === 'explore-domain-options' ||
								card.id === 'move-subscription' ||
								( card.id === 'switch-to-monthly' && onClickDowngrade ) )
					);
					const href = getCardHref( card.id, changePlanUrl, renewNowUrl, subscriptionsUrl );
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
							density="low"
						/>
					);
				} ) }
			</SummaryButtonList>
			<Button variant="secondary" onClick={ onDeclineUpsell } disabled={ cancellationInProgress }>
				{ __( 'No thanks, cancel my plan' ) }
			</Button>
		</VStack>
	);
}
