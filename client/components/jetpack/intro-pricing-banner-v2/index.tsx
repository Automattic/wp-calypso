import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import { INTRO_PRICING_DISCOUNT_PERCENTAGE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { JetpackSaleCoupon } from 'calypso/state/marketing/selectors';
import './style.scss';
import guaranteeBadge from './14-day-badge.svg';
import rocket from './rocket.svg';

// since this amount is backed into the badge above we make it a const
const GUARANTEE_DAYS = 14;

interface Props {
	jetpackSaleCoupon: JetpackSaleCoupon | null;
}

const IntroPricingBannerV2: FunctionComponent< Props > = ( { jetpackSaleCoupon } ) => {
	const translate = useTranslate();
	const isNotMobile = useViewportMatch( 'mobile', '>=' );

	const discountPercentage =
		jetpackSaleCoupon !== null ? jetpackSaleCoupon.discount : INTRO_PRICING_DISCOUNT_PERCENTAGE;

	return (
		<div className="intro-pricing-banner-v2">
			<div className="intro-pricing-banner-v2__discount">
				<img
					src={ rocket }
					alt={ translate( 'Rocket representing %(percent)d%% sale', {
						args: { percent: discountPercentage },
						textOnly: true,
					} ) }
				/>
				<span>
					{ preventWidows(
						translate( 'Get %(percent)d%% off your first year*', {
							args: {
								percent: discountPercentage,
							},
							comment: '* clause describing the price adjustment',
						} )
					) }
				</span>
			</div>
			{ isNotMobile && (
				<div className="intro-pricing-banner-v2__guarantee">
					<img
						src={ guaranteeBadge }
						alt={ translate( 'Money Back %(days)d-Day Guarantee Badge', {
							args: { days: GUARANTEE_DAYS },
							textOnly: true,
						} ) }
					/>
					<span>
						{ preventWidows(
							translate( '%(days)d day money back guarantee.**', {
								args: { days: GUARANTEE_DAYS },
								comment: '** clause describing the money back guarantee',
							} )
						) }
					</span>
				</div>
			) }
		</div>
	);
};

export default IntroPricingBannerV2;
