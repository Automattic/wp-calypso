import {
	isWpComAnnualPlan,
	isWpComBiennialPlan,
	isWpComTriennialPlan,
} from '@automattic/calypso-products';
import { SummaryButton } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { getSolutionsForReason } from '../get-solutions-for-reason';
import { CardActionContext, RENEW_COUPON, SOLUTION_CARD_CONFIG } from './solution-cards-config';
import type { SiteDetails } from '@automattic/data-stores';
import type { Purchase } from 'calypso/lib/purchases/types';

const HELP_CENTER_STORE = HelpCenter.register();

function isAnnualOrLongerPlan( productSlug: string ): boolean {
	return (
		isWpComAnnualPlan( productSlug ) ||
		isWpComBiennialPlan( productSlug ) ||
		isWpComTriennialPlan( productSlug )
	);
}

function getConfigForId( id: string ) {
	return SOLUTION_CARD_CONFIG.find( ( c ) => c.id === id );
}

function getTranslatedTitle( id: string, translate: ( s: string ) => string ): string {
	switch ( id ) {
		case 'change-plan':
			return translate( 'Change plan' );
		case 'renew-now-pay-less':
			return translate( 'Renew now and pay less' );
		case 'switch-to-monthly':
			return translate( 'Switch to monthly payments' );
		case 'speak-with-support':
			return translate( 'Speak with our support team' );
		case 'built-by':
			return translate( 'Let us build for you' );
		case 'ask-ai-assistant':
			return translate( 'Ask our AI assistant' );
		default:
			return '';
	}
}

function getTranslatedSubtitle(
	id: string,
	translate: ( s: string ) => string
): string | undefined {
	switch ( id ) {
		// Add subtitle cases when config has subtitle for this id
		default:
			return undefined;
	}
	void translate; // reserved for future subtitle translations
}

type SolutionsCardsUpsellStepProps = {
	cancellationReason: string;
	closeDialog: () => void;
	onClickDowngrade?: ( upsell: string ) => void;
	onDeclineUpsell: () => void;
	purchase: Purchase;
	site: SiteDetails;
};

export default function SolutionsCardsUpsellStep( {
	cancellationReason = '',
	closeDialog,
	onClickDowngrade,
	onDeclineUpsell,
	purchase,
	site,
}: SolutionsCardsUpsellStepProps ) {
	const translate = useTranslate();
	const [ busyButton, setBusyButton ] = useState( '' );
	const solutions = getSolutionsForReason( cancellationReason );
	const { setNewMessagingChat } = useDataStoreDispatch( HELP_CENTER_STORE );

	const showSwitchToMonthly = isAnnualOrLongerPlan( purchase.productSlug );
	const filteredSolutions = solutions.filter(
		( card ) => card.id !== 'switch-to-monthly' || showSwitchToMonthly
	);

	if ( ! filteredSolutions?.length ) {
		return null;
	}

	const changePlanUrl = `/plans/${ site.slug }`;
	const renewNowUrl = `/checkout/${ site.slug }/${ purchase.productSlug }?coupon=${ RENEW_COUPON }`;

	const context: CardActionContext = {
		site,
		purchase,
		closeDialog,
		changePlanUrl,
		renewNowUrl,
		cancellationReason,
		onClickDowngrade,
		setNewMessagingChat,
	};

	const handleDecline = () => {
		setBusyButton( 'decline' );
		onDeclineUpsell();
	};

	return (
		<div className="cancel-purchase-form__upsell">
			<div className="cancel-purchase-form__upsell-content">
				<div className="cancel-purchase-form__upsell-subheader">
					{ translate( 'Here is an idea' ) }
				</div>
				<FormattedHeader
					brandFont
					headerText={ translate( 'Have you tried any of these options?' ) }
				/>
				<div className="cancel-purchase-form__upsell-solutions-cards">
					{ filteredSolutions.map( ( card ) => {
						const config = getConfigForId( card.id );
						if ( ! config ) {
							return null;
						}
						const href = config.getHref?.( context );
						const hasAction =
							Boolean( href ) ||
							Boolean( config.onClick ) ||
							( card.id === 'switch-to-monthly' && onClickDowngrade );
						const handleClick = ( e: React.MouseEvent ) => {
							if ( href && config.onClick ) {
								e.preventDefault();
							}
							config.onClick?.( context );
						};

						return (
							<SummaryButton
								key={ card.id }
								title={ getTranslatedTitle( card.id, translate ) }
								description={ getTranslatedSubtitle( card.id, translate ) }
								decoration={ config.decoration }
								href={ href }
								onClick={ hasAction ? handleClick : undefined }
								showArrow={ hasAction }
							/>
						);
					} ) }
				</div>
				<div className="cancel-purchase-form__upsell-buttons">
					<Button
						variant="secondary"
						onClick={ handleDecline }
						isBusy={ busyButton === 'decline' }
						disabled={ Boolean( busyButton && busyButton !== 'decline' ) }
					>
						{ translate( 'No thanks, cancel my plan' ) }
					</Button>
				</div>
			</div>
		</div>
	);
}
