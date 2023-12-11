import { PremiumBadge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { isMarketplaceThemeSubscribed } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeTier from '../use-theme-tier';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';

export default function ThemeTierPartnerBadge( { themeId } ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isPartnerThemePurchased = useSelector( ( state ) =>
		siteId ? isMarketplaceThemeSubscribed( state, themeId, siteId ) : false
	);
	const { isThemeAllowedOnSite } = useThemeTier( siteId, themeId );

	if ( isPartnerThemePurchased ) {
		return <span>{ translate( 'Included in my plan' ) }</span>;
	}

	const labelText = isThemeAllowedOnSite
		? translate( 'Subscribe' )
		: translate( 'Upgrade and Subscribe' );

	return (
		<>
			<ThemeTierBadgeTracker themeId={ themeId } />
			<PremiumBadge
				className="theme-tier-badge__content"
				focusOnShow={ false }
				isClickable
				labelText={ labelText }
				tooltipClassName="theme-tier-badge-tooltip"
				tooltipContent={ null }
				tooltipPosition="top"
			/>
		</>
	);
}
