import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
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
	const { showUpgradeBadge, themeId } = useThemeTierBadgeContext();
	const isThemeIncluded = useSelector(
		( state ) => siteId && canUseTheme( state, siteId, themeId )
	);

	const tooltipContent = (
		<>
			<ThemeTierTooltipTracker />
			<div data-testid="upsell-message">
				{ createInterpolateElement(
					translate(
						'This community theme can only be installed if you have the <Link>%(businessPlanName)s plan</Link> or higher on your site.',
						{ args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' } }
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
			{ showUpgradeBadge && ! isThemeIncluded && (
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
