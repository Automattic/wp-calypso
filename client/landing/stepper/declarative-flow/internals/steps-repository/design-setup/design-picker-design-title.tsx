import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { PremiumBadge, BundledBadge } from '@automattic/components';
import { useSelect } from '@wordpress/data';
import bundleSettings from 'calypso/my-sites/theme/bundle-settings';
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

	const showBundledBadge = selectedDesign.is_bundled_with_woo_commerce;

	let badge: React.ReactNode = null;
	if ( showBundledBadge ) {
		const settings = bundleSettings[ 'woo-on-plans' ];
		badge = <BundledBadge icon={ settings.badgeIcon }>{ settings.name }</BundledBadge>;
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
