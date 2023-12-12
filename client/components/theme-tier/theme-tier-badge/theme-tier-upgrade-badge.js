import { PremiumBadge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import ThemeTierBadgeTracker from './theme-tier-badge-tracker';

export default function ThemeTierUpgradeBadge( { themeId } ) {
	const translate = useTranslate();

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
