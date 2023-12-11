import { PremiumBadge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { canUseTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';

export default function ThemeTierCommunityBadge( { themeId } ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const legacyCanUseTheme = useSelector(
		( state ) => siteId && canUseTheme( state, siteId, themeId )
	);

	if ( legacyCanUseTheme ) {
		return <span>{ translate( 'Included in my plan' ) }</span>;
	}

	return (
		<>
			<ThemeTierBadgeTracker themeId={ themeId } />
			<PremiumBadge
				className="theme-tier-badge__content"
				focusOnShow={ false }
				isClickable
				labelText={ translate( 'Upgrade' ) }
				tooltipClassName="theme-tier-badge-tooltip"
				tooltipContent={ null }
				tooltipPosition="top"
			/>
		</>
	);
}
