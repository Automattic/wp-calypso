import { useTranslate } from 'i18n-calypso';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import PressableOfferBanner from './banner';
import { PRESSABLE_Q3_2026_OFFER_DEADLINE } from './constants';

const FULL_TERMS_URL = 'https://pressable.com/legal/late-summer-promotion-terms-and-conditions/';

const PressableIntroductoryOffer = () => {
	const translate = useTranslate();

	const agency = useSelector( getActiveAgency );

	const pressableOwnership = usePressableOwnershipType();

	const shouldShowOffer =
		agency?.billing_system === 'billingdragon' &&
		pressableOwnership !== 'agency' &&
		new Date() <= PRESSABLE_Q3_2026_OFFER_DEADLINE;

	if ( ! shouldShowOffer ) {
		return null;
	}

	return (
		<PressableOfferBanner
			title={ translate(
				'{{b}}Limited time offer:{{/b}} Get up to 6 months of free Pressable hosting on new plans!',
				{
					components: {
						b: <b />,
					},
				}
			) }
			items={ [
				translate(
					'{{b}}6 months free on annual plans:{{/b}} Purchase a 12-month plan and receive a 50% discount on the upfront cost.',
					{
						components: {
							b: <b />,
						},
					}
				),
				translate(
					'{{b}}3 months free on monthly plans:{{/b}} Choose a monthly billing cycle and receive savings equal to 3 free months (applied as a discount evenly across the first 12 invoices).',
					{
						components: {
							b: <b />,
						},
					}
				),
				translate(
					'{{b}}Automattic for Agencies exclusive:{{/b}} As a partner, you can unlock these savings on Pressable’s full Signature Plan suite in addition to Premium plans.',
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
			footnote={ translate( '*Offer valid August 11 – September 30, 2026' ) }
			toggleEventName="calypso_a4a_pressable_promo_offer_q3_2026_toggle_view"
			ctaEventName="calypso_a4a_pressable_promo_offer_q3_2026_see_full_terms_click"
		/>
	);
};

export default PressableIntroductoryOffer;
