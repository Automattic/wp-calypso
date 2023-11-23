import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PremiumBadge, BundledBadge } from '@automattic/components';
import {
	FREE_THEME,
	DOT_ORG_THEME,
	MARKETPLACE_THEME,
	WOOCOMMERCE_THEME,
	PREMIUM_THEME,
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

	useEffect( () => {
		if ( type === FREE_THEME && ! isLockedStyleVariation ) {
			return;
		}
		recordTracksEvent( 'calypso_upgrade_nudge_impression', {
			cta_name: 'theme-upsell',
			theme: themeId,
		} );
	}, [ type, themeId, isLockedStyleVariation ] );

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
	if ( type === WOOCOMMERCE_THEME ) {
		const icon = (
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M4.67025 6.64275C4.45031 6.64285 4.23254 6.68636 4.02945 6.77081C3.82636 6.85525 3.64194 6.97895 3.48677 7.13482C3.33159 7.2907 3.20871 7.47567 3.12518 7.67914C3.04165 7.8826 2.99911 8.10056 3 8.3205V13.9132C3 14.8402 3.75075 15.591 4.67775 15.591H11.6175L14.7892 17.3573L14.0677 15.591H19.3223C20.2493 15.591 21 14.841 21 13.9132V8.3205C21 7.3935 20.25 6.64275 19.3223 6.64275H4.67025ZM10.7302 7.626C10.8757 7.6275 11.0092 7.67925 11.1315 7.776C11.1973 7.82565 11.2517 7.88882 11.291 7.96127C11.3304 8.03372 11.3537 8.11377 11.3595 8.196C11.3693 8.31812 11.3438 8.44049 11.286 8.5485C10.9995 9.07875 10.764 9.969 10.5727 11.205C10.3882 12.405 10.3222 13.3395 10.3665 14.0093C10.3815 14.193 10.3515 14.3542 10.278 14.4945C10.2417 14.5688 10.1867 14.6323 10.1182 14.6788C10.0498 14.7252 9.97045 14.753 9.888 14.7593C9.69675 14.7743 9.498 14.6858 9.30675 14.4878C8.622 13.788 8.0775 12.7432 7.68 11.3527C7.3207 12.056 6.96743 12.7622 6.62025 13.4715C6.18675 14.304 5.8185 14.73 5.5095 14.7525C5.31075 14.7675 5.142 14.598 4.99425 14.2447C4.61925 13.2802 4.21425 11.4188 3.78 8.65875C3.7575 8.4675 3.795 8.29875 3.89775 8.166C4.0005 8.0265 4.15575 7.953 4.36125 7.938C4.73625 7.908 4.95 8.085 5.00175 8.4675C5.22975 10.0057 5.48025 11.3085 5.745 12.375L7.35675 9.3075C7.50375 9.02775 7.6875 8.88 7.90875 8.86575C8.232 8.84325 8.43075 9.0495 8.51175 9.48375C8.69625 10.4625 8.93175 11.2942 9.21075 12.0007C9.402 10.1317 9.726 8.78475 10.182 7.953C10.293 7.7475 10.4542 7.644 10.668 7.62975C10.6889 7.62773 10.71 7.62673 10.731 7.62675L10.7302 7.626ZM13.5307 8.42325C13.656 8.42325 13.788 8.43825 13.9282 8.46825C14.4435 8.57775 14.8403 8.85825 15.1058 9.321C15.3413 9.7185 15.4583 10.197 15.4583 10.7708C15.4583 11.529 15.2677 12.2205 14.8845 12.8535C14.4435 13.5893 13.869 13.9575 13.1557 13.9575C13.0305 13.9575 12.8977 13.9425 12.7582 13.9132C12.2355 13.803 11.8455 13.5232 11.5807 13.0597C11.3452 12.6547 11.2275 12.1695 11.2275 11.6025C11.2275 10.845 11.4187 10.1528 11.8012 9.52725C12.2505 8.7915 12.8242 8.42325 13.5307 8.42325ZM18.1448 8.42325C18.27 8.42325 18.402 8.43825 18.5422 8.46825C19.0642 8.57775 19.4542 8.85825 19.7197 9.321C19.9552 9.7185 20.0723 10.197 20.0723 10.7708C20.0723 11.529 19.8817 12.2205 19.4985 12.8535C19.0575 13.5893 18.483 13.9575 17.7698 13.9575C17.6445 13.9575 17.5117 13.9425 17.3722 13.9132C16.8495 13.803 16.4595 13.5232 16.1947 13.0597C15.9592 12.6547 15.8415 12.1695 15.8415 11.6025C15.8415 10.845 16.0327 10.1528 16.4152 9.52725C16.8645 8.7915 17.4383 8.42325 18.1448 8.42325ZM13.5645 9.657C13.3342 9.6555 13.11 9.80775 12.8977 10.1235C12.7097 10.386 12.577 10.6841 12.5077 10.9995C12.4702 11.1683 12.456 11.352 12.456 11.5365C12.456 11.7495 12.501 11.9782 12.5887 12.2062C12.699 12.4927 12.846 12.648 13.023 12.6847C13.2067 12.7215 13.4055 12.6397 13.6192 12.4485C13.8915 12.2062 14.0752 11.8455 14.178 11.3595C14.2155 11.1907 14.2297 11.007 14.2297 10.815C14.2273 10.5855 14.1825 10.3585 14.0977 10.1453C13.9867 9.85875 13.8397 9.70425 13.6627 9.6675C13.6304 9.66098 13.5975 9.65746 13.5645 9.657ZM18.1785 9.657C17.9482 9.6555 17.724 9.80775 17.5117 10.1235C17.3237 10.386 17.191 10.6841 17.1217 10.9995C17.085 11.1683 17.07 11.352 17.07 11.5365C17.07 11.7495 17.115 11.9782 17.2027 12.2062C17.313 12.4927 17.4607 12.648 17.637 12.6847C17.8207 12.7215 18.0195 12.6397 18.2332 12.4485C18.5055 12.2062 18.6892 11.8455 18.792 11.3595C18.822 11.1907 18.8445 11.007 18.8445 10.815C18.8418 10.5855 18.7968 10.3584 18.7117 10.1453C18.6007 9.85875 18.4537 9.70425 18.2767 9.6675C18.2444 9.66098 18.2115 9.65746 18.1785 9.657Z"
				/>
			</svg>
		);
		badgeContent = (
			<BundledBadge { ...badgeContentProps } icon={ icon }>
				WooCommerce
			</BundledBadge>
		);
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
