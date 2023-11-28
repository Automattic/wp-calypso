import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PremiumBadge, BundledBadge } from '@automattic/components';
import {
	FREE_THEME,
	DOT_ORG_THEME,
	MARKETPLACE_THEME,
	BUNDLED_THEME,
	PREMIUM_THEME,
} from '@automattic/design-picker';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import bundleSettings from 'calypso/my-sites/theme/bundle-settings';
import { useSelector } from 'calypso/state';
import { getThemeType, getThemeSoftwareSet } from 'calypso/state/themes/selectors';
import ThemeTypeBadgeTooltip from './tooltip';

import './style.scss';

interface Props {
	canGoToCheckout?: boolean;
	isLockedStyleVariation?: boolean;
	siteId: number | null;
	siteSlug: string | null;
	themeId: string;
}

const ThemeTypeBadge = ( {
	canGoToCheckout,
	isLockedStyleVariation,
	siteId,
	siteSlug,
	themeId,
}: Props ) => {
	const translate = useTranslate();
	const type = useSelector( ( state ) => getThemeType( state, themeId ) );
	const themeSoftwareSet = useSelector( ( state ) => getThemeSoftwareSet( state, themeId ) );

	useEffect( () => {
		if ( type === FREE_THEME && ! isLockedStyleVariation ) {
			return;
		}
		recordTracksEvent( 'calypso_upgrade_nudge_impression', {
			cta_name: 'theme-upsell',
			theme: themeId,
		} );
	}, [ type, themeId, isLockedStyleVariation ] );

	const themeSoftware = themeSoftwareSet[ 0 ];

	const badgeContentProps = {
		className: 'theme-type-badge__content',
		tooltipClassName: 'theme-type-badge-tooltip',
		tooltipContent: (
			<ThemeTypeBadgeTooltip
				canGoToCheckout={ canGoToCheckout }
				isLockedStyleVariation={ isLockedStyleVariation }
				siteId={ siteId }
				siteSlug={ siteSlug }
				themeId={ themeId }
			/>
		),
		tooltipPosition: 'top',
		focusOnShow: false,
		isClickable: true,
	};

	let badgeContent;
	if ( type === BUNDLED_THEME ) {
		if ( bundleSettings[ themeSoftware ] ) {
			const settings = bundleSettings[ themeSoftware ];
			const BadgeIcon = settings.badgeIconComponent;

			const bundleBadgeProps = {
				color: settings.badgeColor,
				icon: <BadgeIcon />,
			};

			badgeContent = (
				<BundledBadge { ...badgeContentProps } { ...bundleBadgeProps }>
					{ settings.name }
				</BundledBadge>
			);
		}
	} else if ( isLockedStyleVariation ) {
		badgeContent = <PremiumBadge { ...badgeContentProps } />;
	} else if ( type === FREE_THEME ) {
		badgeContent = <>{ translate( 'Free' ) }</>;
	} else if ( type === DOT_ORG_THEME ) {
		badgeContent = (
			<PremiumBadge
				{ ...badgeContentProps }
				className={ classNames( badgeContentProps.className, 'is-dot-org' ) }
				labelText={ translate( 'Community', {
					context: 'This theme is developed and supported by a community',
					textOnly: true,
				} ) }
				shouldHideIcon
			/>
		);
	} else if ( type === MARKETPLACE_THEME ) {
		badgeContent = (
			<PremiumBadge
				{ ...badgeContentProps }
				className={ classNames( badgeContentProps.className, 'is-marketplace' ) }
				labelText={ translate( 'Partner', {
					context: 'This theme is developed and supported by a theme partner',
					textOnly: true,
				} ) }
			/>
		);
	} else if ( type === PREMIUM_THEME ) {
		badgeContent = <PremiumBadge { ...badgeContentProps } />;
	}

	return <div className="theme-type-badge">{ badgeContent }</div>;
};

export default ThemeTypeBadge;
