import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import i18n, { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { canUseTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThemeTierBadgeCheckoutLink from './theme-tier-badge-checkout-link';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';
import ThemeTierTooltipTracker from './theme-tier-tooltip-tracker';

export default function ThemeTierCommunityBadge() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const { themeId } = useThemeTierBadgeContext();
	const isEnglishLocale = useIsEnglishLocale();
	const isThemeIncluded = useSelector(
		( state ) => siteId && canUseTheme( state, siteId, themeId )
	);

	const tooltipContent = (
		<>
			<ThemeTierTooltipTracker />
			<div data-testid="upsell-header" className="theme-tier-badge-tooltip__header">
				{ translate( 'Community theme', {
					context: 'This theme is developed and supported by a community',
					textOnly: true,
				} ) }
			</div>
			<div data-testid="upsell-message">
				{ createInterpolateElement(
					isEnglishLocale ||
						i18n.hasTranslation(
							'This community theme can only be installed if you have the <Link>%(businessNamePlan)s plan</Link> or higher on your site.'
						)
						? translate(
								'This community theme can only be installed if you have the <Link>%(businessNamePlan)s plan</Link> or higher on your site.',
								{ args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' } }
						  )
						: translate(
								'This community theme can only be installed if you have the <Link>Business plan</Link> or higher on your site.'
						  ),
					{
						Link: <ThemeTierBadgeCheckoutLink plan="business" />,
					}
				) }
			</div>
		</>
	);

	return (
		<>
			{ ! isThemeIncluded && (
				<>
					<ThemeTierBadgeTracker />
					<PremiumBadge
						className="theme-tier-badge__content"
						focusOnShow={ false }
						isClickable
						labelText={ translate( 'Upgrade' ) }
						tooltipClassName="theme-tier-badge-tooltip"
						tooltipContent={ tooltipContent }
						tooltipPosition="top"
					/>
				</>
			) }

			<PremiumBadge
				className="theme-tier-badge__content is-third-party"
				focusOnShow={ false }
				isClickable={ false }
				labelText={ translate( 'Community' ) }
				shouldHideIcon
				shouldHideTooltip
			/>
		</>
	);
}
