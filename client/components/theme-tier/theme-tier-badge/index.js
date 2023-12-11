import { BUNDLED_THEME, DOT_ORG_THEME, MARKETPLACE_THEME } from '@automattic/design-picker';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getThemeType } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeTier from '../use-theme-tier';
import ThemeTierBundledBadge from './theme-tier-bundled-badge';
import ThemeTierCommunityBadge from './theme-tier-community-badge';
import ThemeTierPartnerBadge from './theme-tier-partner-badge';
import ThemeTierStyleVariationBadge from './theme-tier-style-variation-badge';
import ThemeTierUpgradeBadge from './theme-tier-upgrade-badge';

import './style.scss';

export default function ThemeTierBadge( { isLockedStyleVariation, themeId } ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const themeType = useSelector( ( state ) => getThemeType( state, themeId ) );
	const { themeTier, isThemeAllowedOnSite } = useThemeTier( siteId, themeId );

	const labelClassName = 'theme-tier-badge';

	if ( BUNDLED_THEME === themeType ) {
		return (
			<div className={ labelClassName }>
				<ThemeTierBundledBadge themeId={ themeId } />
			</div>
		);
	}

	if ( isLockedStyleVariation ) {
		return (
			<div className={ labelClassName }>
				<ThemeTierStyleVariationBadge themeId={ themeId } />
			</div>
		);
	}

	if ( DOT_ORG_THEME === themeType ) {
		return (
			<div className={ labelClassName }>
				<ThemeTierCommunityBadge themeId={ themeId } />
			</div>
		);
	}

	if ( 'partner' === themeTier.slug || MARKETPLACE_THEME === themeType ) {
		return (
			<div className={ labelClassName }>
				<ThemeTierPartnerBadge themeId={ themeId } />
			</div>
		);
	}

	if ( isThemeAllowedOnSite ) {
		return (
			<div className={ labelClassName }>
				<span>{ siteId ? translate( 'Included in my plan' ) : translate( 'Free' ) }</span>
			</div>
		);
	}

	return (
		<div className={ labelClassName }>
			<ThemeTierUpgradeBadge themeId={ themeId } />
		</div>
	);
}
