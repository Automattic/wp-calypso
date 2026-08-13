import { useTranslate } from 'i18n-calypso';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import PressableOfferBanner from './banner';
import { PRESSABLE_Q3_2026_OFFER_DEADLINE } from './constants';
import useHasBenefitedFromIntroductoryOffer from './hooks/use-has-benefited-from-introductory-offer';

const FULL_TERMS_URL = 'https://pressable.com/legal/';

const PressableExpansionOfferBanner = () => {
	const translate = useTranslate();

	const { hasBenefited, isReady } = useHasBenefitedFromIntroductoryOffer();

	if ( ! isReady || hasBenefited !== false ) {
		return null;
	}

	return (
		<PressableOfferBanner
			title={ translate(
				'{{b}}Pressable expansion offer:{{/b}} Save when you expand your existing Pressable plan!',
				{
					components: {
						b: <b />,
					},
				}
			) }
			items={ [
				translate(
					'{{b}}Placeholder benefit:{{/b}} Dummy copy describing the first perk of the expansion offer.',
					{
						components: {
							b: <b />,
						},
					}
				),
				translate(
					'{{b}}Placeholder benefit:{{/b}} Dummy copy describing the second perk of the expansion offer.',
					{
						components: {
							b: <b />,
						},
					}
				),
				translate(
					'You will continue to earn your standard revenue share and reseller incentives on these accounts.'
				),
			] }
			ctaLabel={ translate( 'See full terms ↗' ) }
			ctaUrl={ FULL_TERMS_URL }
			footnote={ translate( '*Offer valid for a limited time' ) }
			toggleEventName="calypso_a4a_pressable_expansion_offer_toggle_view"
			ctaEventName="calypso_a4a_pressable_expansion_offer_see_full_terms_click"
		/>
	);
};

const PressableExpansionOffer = () => {
	const agency = useSelector( getActiveAgency );

	const pressableOwnership = usePressableOwnershipType();

	// Gate before rendering the banner so the license fetch it depends on only
	// runs for agencies that own a Pressable plan through A4A.
	const shouldShowOffer =
		agency?.billing_system === 'billingdragon' &&
		pressableOwnership === 'agency' &&
		new Date() <= PRESSABLE_Q3_2026_OFFER_DEADLINE;

	if ( ! shouldShowOffer ) {
		return null;
	}

	return <PressableExpansionOfferBanner />;
};

export default PressableExpansionOffer;
