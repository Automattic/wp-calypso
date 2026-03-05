import { SubscriptionBillPeriod } from '@automattic/api-core';
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import * as React from 'react';
import { useHelpCenter } from '../../../../../app/help-center';
import DashboardSummaryButton from '../../../../../components/summary-button';
import { wpcomLink } from '../../../../../utils/link';
import { getSolutionsForReason } from '../../get-solutions-for-reason';
import type { PlanProduct, Purchase } from '@automattic/api-core';

const BUILT_BY_URL = 'https://wordpress.com/website-design-service/?ref=wpcom-cancel-flow';
const RENEW_COUPON = 'biz25';

function isAnnualOrLongerPlan( purchase: Purchase ): boolean {
	return (
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD ||
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_BIENNIAL_PERIOD ||
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_TRIENNIAL_PERIOD
	);
}

function getCardHref(
	cardId: string,
	changePlanUrl: string,
	renewNowUrl: string
): string | undefined {
	if ( cardId === 'change-plan' ) {
		return changePlanUrl;
	}
	if ( cardId === 'renew-now-pay-less' ) {
		return renewNowUrl;
	}
	if ( cardId === 'built-by' ) {
		return BUILT_BY_URL;
	}
	return undefined;
}

function getCardOnClick(
	cardId: string,
	hasAction: boolean,
	handleCardAction: ( id: string ) => void
): ( ( e: React.MouseEvent ) => void ) | ( () => void ) | undefined {
	if ( cardId === 'built-by' || cardId === 'change-plan' || cardId === 'renew-now-pay-less' ) {
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
	plans: PlanProduct[];
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

	const handleCardAction = ( solutionId: string ) => {
		switch ( solutionId ) {
			case 'change-plan':
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
			case 'ask-ai-assistant':
				// No CTA yet – card is label-only
				break;
			default:
				break;
		}
	};

	return (
		<VStack spacing={ 6 }>
			<Heading level={ 3 }>{ __( 'Have you tried any of these options?' ) }</Heading>
			<VStack spacing={ 3 }>
				{ filteredSolutions.map( ( card ) => {
					const hasAction =
						card.id !== 'ask-ai-assistant' &&
						( card.id === 'speak-with-support' ||
							card.id === 'built-by' ||
							card.id === 'change-plan' ||
							card.id === 'renew-now-pay-less' ||
							( card.id === 'switch-to-monthly' && onClickDowngrade ) );
					const href = getCardHref( card.id, changePlanUrl, renewNowUrl );
					const onClick = getCardOnClick( card.id, hasAction, handleCardAction );
					const title = getCardTitle( card.id );

					return (
						<DashboardSummaryButton
							key={ card.id }
							title={ title }
							href={ href }
							onClick={ onClick }
							showArrow={ hasAction }
						/>
					);
				} ) }
			</VStack>
			<Button variant="secondary" onClick={ onDeclineUpsell } disabled={ cancellationInProgress }>
				{ __( 'No thanks, cancel my plan' ) }
			</Button>
		</VStack>
	);
}
