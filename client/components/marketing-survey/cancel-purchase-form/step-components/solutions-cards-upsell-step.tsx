import {
	isWpComAnnualPlan,
	isWpComBiennialPlan,
	isWpComTriennialPlan,
} from '@automattic/calypso-products';
import { SummaryButton } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import {
	Icon,
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
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { getSolutionsForReason } from '../get-solutions-for-reason';
import { CardActionContext, RENEW_COUPON, SOLUTION_CARD_CONFIG } from './solution-cards-config';
import UpsellStep from './upsell-step';
import type { SiteDetails } from '@automattic/data-stores';
import type { Purchase } from 'calypso/lib/purchases/types';

const HELP_CENTER_STORE = HelpCenter.register();

const CARD_ICONS: Record< string, React.ReactElement > = {
	'change-plan': reusableBlock,
	'switch-to-monthly': calendar,
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
		case 'upgrade-for-full-access':
			return translate( 'Pick another paid plan for access to more features' );
		case 'get-theme-addon':
			return translate( 'Change your plan' );
		case 'find-guides':
			return translate( 'Find easy step-by-step guides' );
		case 'make-site-faster':
			return translate( 'Make your site faster' );
		case 'use-migration-tools':
			return translate( 'Use our migration tools' );
		case 'use-domain-guide':
			return translate( 'Use our domain guide' );
		case 'explore-domain-options':
			return translate( 'Explore more domain options' );
		default:
			return '';
	}
}

function getTranslatedSubtitle(
	id: string,
	translate: ( s: string ) => string
): string | undefined {
	switch ( id ) {
		case 'change-plan':
			return translate( 'Find a plan that better suits your needs.' );
		case 'renew-now-pay-less':
			return translate( 'Get an exclusive 25% discount automatically applied at checkout.' );
		case 'switch-to-monthly':
			return translate( 'Keep things flexible with monthly billing.' );
		case 'speak-with-support':
			return translate( "We're here to answer any of your questions." );
		case 'built-by':
			return translate( 'Our team can build your site so you can focus on what matters.' );
		case 'ask-ai-assistant':
			return translate( 'Use our AI assistant to quickly find solutions.' );
		case 'upgrade-for-full-access':
			return translate( 'Get the business plan to access all available plugins and themes.' );
		case 'get-theme-addon':
			return translate( 'Unlock premium themes on another plan.' );
		case 'find-guides':
			return translate( 'Browse our guides and get back on track quickly.' );
		case 'make-site-faster':
			return translate( 'Run our free speed test and get personalized recommendations.' );
		case 'use-migration-tools':
			return translate( 'Expert assistance or seamless importers for quick moves.' );
		case 'use-domain-guide':
			return translate( 'Follow our simple guide to get connected quickly.' );
		case 'explore-domain-options':
			return translate( "Our search tool finds great alternatives you'll love." );
		default:
			return undefined;
	}
}

type SolutionsCardsUpsellStepProps = {
	cancellationReason: string;
	cancelBundledDomain?: boolean;
	closeDialog: () => void;
	downgradePlanPrice?: number | null;
	includedDomainPurchase?: object;
	onClickDowngrade?: ( upsell: string ) => void;
	onDeclineUpsell: () => void;
	purchase: Purchase;
	refundAmount?: string;
	site: SiteDetails;
};

export default function SolutionsCardsUpsellStep( {
	cancellationReason = '',
	cancelBundledDomain,
	closeDialog,
	downgradePlanPrice,
	includedDomainPurchase,
	onClickDowngrade,
	onDeclineUpsell,
	purchase,
	refundAmount,
	site,
}: SolutionsCardsUpsellStepProps ) {
	const translate = useTranslate();
	const [ busyButton, setBusyButton ] = useState( '' );
	const [ showDowngradeStep, setShowDowngradeStep ] = useState( false );
	const solutions = getSolutionsForReason( cancellationReason );
	const { setNewMessagingChat, setOpenOdieWithContext } = useDataStoreDispatch( HELP_CENTER_STORE );

	const showSwitchToMonthly = isAnnualOrLongerPlan( purchase.productSlug );
	const filteredSolutions = solutions?.filter(
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
		onSelectSwitchToMonthly: () => setShowDowngradeStep( true ),
		setNewMessagingChat,
		setOpenOdieWithContext,
	};

	if ( showDowngradeStep ) {
		return (
			<UpsellStep
				upsell="downgrade-monthly"
				cancellationReason={ cancellationReason }
				cancelBundledDomain={ cancelBundledDomain }
				closeDialog={ closeDialog }
				downgradePlanPrice={ downgradePlanPrice }
				includedDomainPurchase={ includedDomainPurchase }
				onClickDowngrade={ onClickDowngrade }
				onDeclineUpsell={ () => setShowDowngradeStep( false ) }
				purchase={ purchase }
				refundAmount={ refundAmount }
				site={ site }
			/>
		);
	}

	const handleDecline = () => {
		setBusyButton( 'decline' );
		onDeclineUpsell();
	};

	return (
		<div className="cancel-purchase-form__upsell">
			<div className="cancel-purchase-form__upsell-content">
				<FormattedHeader
					brandFont
					headerText={
						filteredSolutions.length === 1
							? translate( "Before you cancel, here's an idea:" )
							: translate( 'Have you tried any of these options?' )
					}
				/>
				<div className="cancel-purchase-form__upsell-solutions-cards">
					{ filteredSolutions.map( ( card ) => {
						const config = getConfigForId( card.id );
						if ( ! config ) {
							return null;
						}
						const href = config.getHref?.( context );
						const hasAction = Boolean(
							href || config.onClick || ( card.id === 'switch-to-monthly' && onClickDowngrade )
						);
						const handleClick = ( e: React.MouseEvent ) => {
							if ( href && config.onClick ) {
								e.preventDefault();
							}
							config.onClick?.( context );
						};

						return (
							<SummaryButton
								key={ card.id }
								className="cancel-purchase-form__solution-card"
								title={ getTranslatedTitle( card.id, translate ) }
								description={ getTranslatedSubtitle( card.id, translate ) }
								decoration={ config.decoration ?? getDecorationForCard( card.id ) }
								href={ href }
								onClick={ hasAction ? handleClick : undefined }
								showArrow={ hasAction }
								density="medium-low"
							/>
						);
					} ) }
				</div>
				<div>
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
