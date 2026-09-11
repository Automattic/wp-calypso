import {
	Button,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { a4aLink } from '../../../utils/link';
import {
	PRESSABLE_EXPANSION_OFFER_TERMS_URL,
	PRESSABLE_INTRODUCTORY_OFFER_TERMS_URL,
} from '../../overview/constants';
import usePressableOfferEligibility, {
	isPressableOfferActive,
} from '../../overview/use-pressable-offer-eligibility';
import { CheckList } from './content-sections';
import type { Agency } from '@automattic/api-core';
import type { ReactNode } from 'react';

interface BannerCta {
	label: string;
	url: string;
	eventName: string;
	variant?: 'primary' | 'secondary';
	isExternal?: boolean;
}

interface BannerProps {
	title: ReactNode;
	items: ReactNode[];
	ctas: BannerCta[];
	footnote: string;
	toggleEventName: string;
}

function PressableOfferBanner( { title, items, ctas, footnote, toggleEventName }: BannerProps ) {
	const { recordTracksEvent } = useAnalytics();
	const [ isExpanded, setIsExpanded ] = useState( true );

	const toggle = () => {
		recordTracksEvent( toggleEventName, { event_type: isExpanded ? 'collapse' : 'expand' } );
		setIsExpanded( ! isExpanded );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<HStack justify="space-between" alignment="center">
						<Text weight={ 600 }>{ title }</Text>
						<Button
							icon={ isExpanded ? chevronUp : chevronDown }
							label={ isExpanded ? __( 'Collapse offer details' ) : __( 'Expand offer details' ) }
							size="compact"
							aria-expanded={ isExpanded }
							onClick={ toggle }
						/>
					</HStack>
					{ isExpanded && (
						<>
							<CheckList items={ items } />
							<ButtonStack justify="flex-start" expanded={ false } wrap>
								{ ctas.map( ( cta ) => (
									<Button
										key={ cta.eventName }
										variant={ cta.variant ?? 'secondary' }
										size="compact"
										href={ cta.url }
										{ ...( cta.isExternal && { target: '_blank', rel: 'noreferrer' } ) }
										onClick={ () => recordTracksEvent( cta.eventName ) }
									>
										{ cta.label }
									</Button>
								) ) }
							</ButtonStack>
							<Text variant="muted" size={ 12 }>
								{ footnote }
							</Text>
						</>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

const bold = ( text: string ) => createInterpolateElement( text, { b: <b /> } );

// The same eligibility rules as the Overview cards: the introductory offer
// targets agencies without a Pressable plan through A4A, the expansion offer
// agencies on an eligible plan that did not benefit from the introductory one.
export default function PressableOffers( { agency }: { agency: Agency | null | undefined } ) {
	const { isEligibleForPressableIntroOffer, isEligibleForPressableExpansionOffer } =
		usePressableOfferEligibility( agency );
	if ( ! isPressableOfferActive() ) {
		return null;
	}

	if ( isEligibleForPressableIntroOffer ) {
		return (
			<PressableOfferBanner
				title={ bold(
					/* translators: <b> wraps the bold lead-in. */
					__(
						'<b>Limited time offer:</b> Get up to 6 months of free Pressable hosting on new plans!'
					)
				) }
				items={ [
					bold(
						/* translators: <b> wraps the bold lead-in. */
						__(
							'<b>6 months free on annual plans:</b> Purchase a 12-month plan and get 50% off the upfront cost.'
						)
					),
					bold(
						/* translators: <b> wraps the bold lead-in. */
						__(
							'<b>3 months free on monthly plans:</b> Choose a monthly billing cycle and receive savings equal to 3 free months (applied as a discount evenly across the first 12 invoices).'
						)
					),
					bold(
						/* translators: <b> wraps the bold lead-in. */
						__(
							'<b>Automattic for Agencies exclusive:</b> As a partner, you can unlock these savings on Pressable’s full Signature Plan suite in addition to Premium plans.'
						)
					),
					__(
						'You will continue to earn your standard revenue share and reseller incentives on these accounts.'
					),
				] }
				ctas={ [
					{
						label: __( 'See full terms ↗' ),
						url: PRESSABLE_INTRODUCTORY_OFFER_TERMS_URL,
						eventName: 'calypso_a4a_pressable_promo_offer_q3_2026_see_full_terms_click',
						isExternal: true,
					},
				] }
				footnote={ __( '*Offer valid August 11 – September 30, 2026' ) }
				toggleEventName="calypso_a4a_pressable_promo_offer_q3_2026_toggle_view"
			/>
		);
	}

	if ( ! isEligibleForPressableExpansionOffer ) {
		return null;
	}

	return (
		<PressableOfferBanner
			title={ bold(
				/* translators: <b> wraps the bold lead-in. */
				__(
					'<b>Limited time offer:</b> Upgrade your Pressable plan and get up to 6 months of the upgrade free'
				)
			) }
			items={ [
				bold(
					/* translators: <b> wraps the bold lead-in. */
					__(
						'<b>Annual upgrades:</b> Move up a plan tier and we’ll cover 6 months’ worth of the price increase. Example: upgrading from $10,000 to $13,250/yr is a $3,250 increase, so you save $1,625.'
					)
				),
				bold(
					/* translators: <b> wraps the bold lead-in. */
					__(
						'<b>Monthly upgrades:</b> Move up a plan tier and we’ll cover 3 months’ worth of the price increase. Example: upgrading from $1,000 to $1,325/mo is a $325 increase, so you save $975 (3 × $325).'
					)
				),
				__(
					'The discount is calculated on the price increase from your current plan to your new tier. Note: The discount for monthly plans is applied over a 3-month period.'
				),
				__(
					'Migrating 50+ sites? You may qualify for a custom cash incentive scaling with volume, up to $25,000, in place of the standard discount.'
				),
			] }
			ctas={ [
				{
					label: __( 'Talk to us about the offer' ),
					// TODO: The MSD has no contact-support widget yet; this opens the
					// classic hosting page with the widget's hash fragment.
					url: a4aLink( '/marketplace/hosting/pressable#contact-support-pressable-offer' ),
					eventName: 'calypso_a4a_pressable_expansion_offer_talk_to_us_click',
					variant: 'primary',
				},
				{
					label: __( 'See full terms ↗' ),
					url: PRESSABLE_EXPANSION_OFFER_TERMS_URL,
					eventName: 'calypso_a4a_pressable_expansion_offer_see_full_terms_click',
					isExternal: true,
				},
			] }
			footnote={ __( '*Offer valid August 11 – September 30, 2026' ) }
			toggleEventName="calypso_a4a_pressable_expansion_offer_toggle_view"
		/>
	);
}
