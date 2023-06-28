import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	FREE_THEME,
	DOT_ORG_THEME,
	MARKETPLACE_THEME,
	WOOCOMMERCE_THEME,
	PREMIUM_THEME,
	PremiumBadge,
	WooCommerceBundledBadge,
} from '@automattic/design-picker';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { getThemeType } from 'calypso/state/themes/selectors';
import ThemeTypeBadgeTooltip from './tooltip';

import './style.scss';

interface Props {
	canGoToCheckout?: boolean;
	forcePremium?: boolean;
	siteId: number | null;
	siteSlug: string | null;
	themeId: string;
	tooltipHeader?: string;
	tooltipMessage?: string;
}

const ThemeTypeBadge = ( {
	canGoToCheckout,
	forcePremium,
	siteId,
	siteSlug,
	themeId,
	tooltipHeader,
	tooltipMessage,
}: Props ) => {
	const translate = useTranslate();
	const _type = useSelector( ( state ) => getThemeType( state, themeId ) );
	const type = forcePremium ? PREMIUM_THEME : _type;

	useEffect( () => {
		if ( type === FREE_THEME ) {
			return;
		}
		recordTracksEvent( 'calypso_upgrade_nudge_impression', {
			cta_name: 'theme-upsell',
			theme: themeId,
		} );
	}, [ type, themeId ] );

	const badgeContentProps = {
		className: 'theme-type-badge__content',
		tooltipClassName: 'theme-type-badge-tooltip',
		tooltipContent: (
			<ThemeTypeBadgeTooltip
				canGoToCheckout={ canGoToCheckout }
				forcePremium={ forcePremium }
				siteId={ siteId }
				siteSlug={ siteSlug }
				themeId={ themeId }
				tooltipHeader={ tooltipHeader }
				tooltipMessage={ tooltipMessage }
			/>
		),
		tooltipPosition: 'top',
		focusOnShow: false,
		isClickable: true,
	};

	let badgeContent;
	if ( type === FREE_THEME ) {
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
				labelText={ translate( 'Paid', {
					context: 'Refers to paid service, such as paid theme',
					textOnly: true,
				} ) }
			/>
		);
	} else if ( type === WOOCOMMERCE_THEME ) {
		badgeContent = <WooCommerceBundledBadge { ...badgeContentProps } />;
	} else if ( type === PREMIUM_THEME ) {
		badgeContent = <PremiumBadge { ...badgeContentProps } />;
	}

	return <div className="theme-type-badge">{ badgeContent }</div>;
};

export default ThemeTypeBadge;
