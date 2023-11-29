import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { PremiumBadge, BundledBadge } from '@automattic/components';
import { useSelect } from '@wordpress/data';
import useBundleSettings from 'calypso/my-sites/theme/hooks/use-bundle-settings';
import { useSite } from '../../../../hooks/use-site';
import { SITE_STORE } from '../../../../stores';
import type { SiteSelect } from '@automattic/data-stores';
import type { Design } from '@automattic/design-picker';
import type { FC } from 'react';

import './design-picker-design-title.scss';

type Props = {
	designTitle: string;
	selectedDesign: Design;
};

const DesignPickerDesignTitle: FC< Props > = ( { designTitle, selectedDesign } ) => {
	const site = useSite();
	// TODO: This does not check for individual theme purchases yet.
	const isPremiumThemeAvailable = Boolean(
		useSelect(
			( select ) =>
				site &&
				( select( SITE_STORE ) as SiteSelect ).siteHasFeature(
					site.ID,
					WPCOM_FEATURES_PREMIUM_THEMES
				),
			[ site ]
		)
	);

	const bundleSettings = useBundleSettings( selectedDesign.slug );

	let badge: React.ReactNode = null;
	if ( selectedDesign.software_sets && selectedDesign.software_sets.length > 0 ) {
		if ( bundleSettings ) {
			const BadgeIcon = bundleSettings.iconComponent;

			const bundleBadgeProps = {
				color: bundleSettings.color,
				icon: <BadgeIcon />,
				tooltipContent: <>{ bundleSettings.designPickerBadgeTooltip }</>,
			};

			badge = <BundledBadge { ...bundleBadgeProps }>{ bundleSettings.name }</BundledBadge>;
		}
	} else if ( selectedDesign.is_premium ) {
		badge = <PremiumBadge isPremiumThemeAvailable={ isPremiumThemeAvailable } />;
	}

	if ( badge ) {
		return (
			<div className="design-picker-design-title__container">
				{ designTitle }
				{ badge }
			</div>
		);
	}
	return <div>{ designTitle }</div>;
};

export default DesignPickerDesignTitle;
