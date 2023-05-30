/* eslint-disable wpcalypso/jsx-classname-namespace */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import {
	FREE_THEME,
	DOT_ORG_THEME,
	MARKETPLACE_THEME,
	WOOCOMMERCE_THEME,
	PREMIUM_THEME,
} from '../../constants';
import PremiumBadge from '../premium-badge';
import WooCommerceBundledBadge from '../woocommerce-bundled-badge';
import ToolTip from './tooltip';

import './style.scss';

interface Props {
	id: string;
	type: string;
	isPurchased: boolean;
	canUseTheme: boolean;
	subscriptionPrices: { year?: string; month?: string };
	siteSlug?: string;
}

const ThemeTypeBadge = ( {
	id,
	type,
	isPurchased,
	canUseTheme,
	subscriptionPrices,
	siteSlug,
}: Props ) => {
	const translate = useTranslate();

	useEffect( () => {
		if ( type === FREE_THEME ) {
			return;
		}
		recordTracksEvent( 'calypso_upgrade_nudge_impression', {
			cta_name: 'theme-upsell',
			theme: id,
		} );
	}, [ type, id ] );

	const badgeContentProps = {
		className: 'theme-type-badge__content',
		tooltipClassName: 'theme-type-badge-tooltip',
		tooltipContent: (
			<ToolTip
				id={ id }
				type={ type }
				isPurchased={ isPurchased }
				canUseTheme={ canUseTheme }
				subscriptionPrices={ subscriptionPrices }
				siteSlug={ siteSlug }
			/>
		),
		tooltipPosition: 'top',
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
