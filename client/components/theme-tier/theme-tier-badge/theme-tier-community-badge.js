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
	const { themeId } = useThemeTierBadgeContext();
	const legacyCanUseTheme = useSelector(
		( state ) => siteId && canUseTheme( state, siteId, themeId )
	);

	if ( legacyCanUseTheme ) {
		return <span>{ translate( 'Included in my plan' ) }</span>;
	}

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
					translate(
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
	);
}
