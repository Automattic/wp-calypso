import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import referralImage from 'calypso/assets/images/earn/referral.svg';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const PromoCardExample = () => {
	const img = {
		path: referralImage,
		alt: 'Using Props',
	};
	const siteSlug = useSelector( getSelectedSiteSlug );

	const translate = useTranslate();

	const clicked = () => alert( 'Clicked!' );
	return (
		<div className="design-assets__group">
			<div>
				<PromoCard title="Under-used Feature" image={ img } isPrimary={ false }>
					<p>
						This is a description of the action. It gives a bit more detail and explains what we are
						inviting the user to do.
					</p>
					<PromoCardCTA
						cta={ {
							text: translate( 'Upgrade to Pro Plan' ),
							action: {
								url: `/checkout/${ siteSlug }/pro`,
								onClick: clicked,
								selfTarget: true,
							},
						} }
					/>
				</PromoCard>
			</div>
		</div>
	);
};
/* eslint-enable wpcalypso/jsx-classname-namespace */

PromoCardExample.displayName = 'PromoCard';

export default PromoCardExample;
