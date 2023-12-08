import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PremiumBadge, BundledBadge } from '@automattic/components';
import { BUNDLED_THEME, DOT_ORG_THEME, MARKETPLACE_THEME } from '@automattic/design-picker';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import useBundleSettings from 'calypso/my-sites/theme/hooks/use-bundle-settings';
import { useSelector } from 'calypso/state';
import {
	canUseTheme,
	getThemeType,
	isMarketplaceThemeSubscribed,
} from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useThemeTier from './use-theme-tier';

import './theme-tier-badge.scss';

export default function ThemeTierBadge( { isLockedStyleVariation, themeId } ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const themeType = useSelector( ( state ) => getThemeType( state, themeId ) );
	const bundleSettings = useBundleSettings( themeId );
	const isPartnerThemePurchased = useSelector( ( state ) =>
		siteId ? isMarketplaceThemeSubscribed( state, themeId, siteId ) : false
	);
	const legacyCanUseTheme = useSelector(
		( state ) => siteId && canUseTheme( state, siteId, themeId )
	);
	const { themeTier, isThemeAllowedOnSite } = useThemeTier( siteId, themeId );

	useEffect( () => {
		if ( BUNDLED_THEME === themeType && bundleSettings && legacyCanUseTheme ) {
			return;
		}
		if ( isThemeAllowedOnSite && ! isLockedStyleVariation ) {
			return;
		}
		if ( DOT_ORG_THEME === themeType && legacyCanUseTheme ) {
			return;
		}
		if (
			( 'partner' === themeTier.slug || MARKETPLACE_THEME === themeType ) &&
			isPartnerThemePurchased
		) {
			return;
		}
		recordTracksEvent( 'calypso_upgrade_nudge_impression', {
			cta_name: 'theme-upsell',
			theme: themeId,
		} );
	}, [
		bundleSettings,
		isLockedStyleVariation,
		isPartnerThemePurchased,
		isThemeAllowedOnSite,
		legacyCanUseTheme,
		themeId,
		themeTier.slug,
		themeType,
	] );

	const badgeClassName = 'theme-tier-badge';
	const badgeProps = {
		className: 'theme-tier-badge__content',
		focusOnShow: false,
		isClickable: true,
		tooltipClassName: 'theme-tier-badge-tooltip',
		//tooltipContent
		tooltipPosition: 'top',
	};

	if ( BUNDLED_THEME === themeType && bundleSettings ) {
		const BadgeIcon = bundleSettings.iconComponent;

		const bundleBadgeProps = {
			color: bundleSettings.color,
			icon: <BadgeIcon />,
			isClickable: false,
			shouldHideTooltip: true,
		};

		if ( legacyCanUseTheme ) {
			return (
				<div className={ badgeClassName }>
					<BundledBadge { ...badgeProps } { ...bundleBadgeProps }>
						{ bundleSettings.name }
					</BundledBadge>
					<span>{ translate( 'Included in my plan' ) }</span>
				</div>
			);
		}

		return (
			<div className={ badgeClassName }>
				<PremiumBadge { ...badgeProps } labelText={ translate( 'Upgrade' ) } />
				<BundledBadge { ...badgeProps } { ...bundleBadgeProps }>
					{ bundleSettings.name }
				</BundledBadge>
			</div>
		);
	}

	if ( isLockedStyleVariation ) {
		return (
			<div className={ badgeClassName }>
				<PremiumBadge { ...badgeProps } labelText={ translate( 'Upgrade' ) } />
			</div>
		);
	}

	if ( DOT_ORG_THEME === themeType ) {
		if ( legacyCanUseTheme ) {
			return (
				<div className={ badgeClassName }>
					<span>{ translate( 'Included in my plan' ) }</span>
				</div>
			);
		}
		return (
			<div className={ badgeClassName }>
				<PremiumBadge { ...badgeProps } labelText={ translate( 'Upgrade' ) } />
			</div>
		);
	}

	if ( 'partner' === themeTier.slug || MARKETPLACE_THEME === themeType ) {
		if ( isPartnerThemePurchased ) {
			return (
				<div className={ badgeClassName }>
					<span>{ translate( 'Included in my plan' ) }</span>
				</div>
			);
		}
		if ( isThemeAllowedOnSite ) {
			return (
				<div className={ badgeClassName }>
					<PremiumBadge { ...badgeProps } labelText={ translate( 'Subscribe' ) } />
				</div>
			);
		}
		return (
			<div className={ badgeClassName }>
				<PremiumBadge { ...badgeProps } labelText={ translate( 'Upgrade and Subscribe' ) } />
			</div>
		);
	}

	if ( isThemeAllowedOnSite ) {
		return (
			<div className={ badgeClassName }>
				<span>{ siteId ? translate( 'Included in my plan' ) : translate( 'Free' ) }</span>
			</div>
		);
	}

	return (
		<div className={ badgeClassName }>
			<PremiumBadge { ...badgeProps } labelText={ translate( 'Upgrade' ) } />
		</div>
	);
}
