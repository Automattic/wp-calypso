import { useTranslate } from 'i18n-calypso';
import { CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import PressableOfferBanner from './banner';
import { PRESSABLE_EXPANSION_OFFER_TERMS_URL, PRESSABLE_Q3_2026_OFFER_DEADLINE } from './constants';
import useIsEligibleForExpansionOffer from './hooks/use-is-eligible-for-expansion-offer';
import usePressableOfferEligibility from './hooks/use-pressable-offer-eligibility';

const PressableExpansionOfferBanner = () => {
	const translate = useTranslate();

	const isEligibleForExpansionOffer = useIsEligibleForExpansionOffer();

	if ( ! isEligibleForExpansionOffer ) {
		return null;
	}

	return (
		<PressableOfferBanner
			title={ translate(
				'{{b}}Limited time offer:{{/b}} Upgrade your Pressable plan and get up to 6 months of the upgrade free',
				{
					components: {
						b: <b />,
					},
				}
			) }
			items={ [
				translate(
					'{{b}}Annual upgrades:{{/b}} Move up a plan tier and we’ll cover 6 months’ worth of the price increase. Example: upgrading from $10,000 to $13,250/yr is a $3,250 increase, so you save $1,625.',
					{
						components: {
							b: <b />,
						},
					}
				),
				translate(
					'{{b}}Monthly upgrades:{{/b}} Move up a plan tier and we’ll cover 3 months’ worth of the price increase. Example: upgrading from $1,000 to $1,325/mo is a $325 increase, so you save $975 (3 × $325).',
					{
						components: {
							b: <b />,
						},
					}
				),
				translate(
					'The discount is calculated on the price increase from your current plan to your new tier, and applied automatically at checkout. Note: The discount for monthly plans is applied over a 3-month period.'
				),
				translate(
					'Migrating 50+ sites? You may qualify for a custom cash incentive scaling with volume, up to $25,000, in place of the standard discount.'
				),
			] }
			ctas={ [
				{
					label: translate( 'Talk to us about migrations' ),
					url: CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT,
					eventName: 'calypso_a4a_pressable_expansion_offer_talk_to_us_click',
					variant: 'primary',
				},
				{
					label: translate( 'See full terms ↗' ),
					url: PRESSABLE_EXPANSION_OFFER_TERMS_URL,
					eventName: 'calypso_a4a_pressable_expansion_offer_see_full_terms_click',
					isExternal: true,
				},
			] }
			footnote={ translate( '*Offer valid August 11–September 30, 2026' ) }
			toggleEventName="calypso_a4a_pressable_expansion_offer_toggle_view"
		/>
	);
};

const PressableExpansionOffer = () => {
	const { mayBeEligibleForExpansionOffer } = usePressableOfferEligibility();

	// Gate before rendering the banner so the license fetch it depends on only
	// runs for agencies that own a Pressable plan through A4A.
	const shouldShowOffer =
		mayBeEligibleForExpansionOffer && new Date() <= PRESSABLE_Q3_2026_OFFER_DEADLINE;

	if ( ! shouldShowOffer ) {
		return null;
	}

	return <PressableExpansionOfferBanner />;
};

export default PressableExpansionOffer;
