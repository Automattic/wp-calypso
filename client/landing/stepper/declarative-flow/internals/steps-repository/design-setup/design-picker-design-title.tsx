import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/design-picker';
import { useSelect } from '@wordpress/data';
import { useSite } from '../../../../hooks/use-site';
import { SITE_STORE } from '../../../../stores';
import type { Design } from '@automattic/design-picker';
import type { FC } from 'react';

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
				site && select( SITE_STORE ).siteHasFeature( site.ID, WPCOM_FEATURES_PREMIUM_THEMES )
		)
	);

	if ( selectedDesign.is_premium ) {
		return (
			<div>
				{ designTitle } <PremiumBadge isPremiumThemeAvailable={ isPremiumThemeAvailable } />
			</div>
		);
	}
	return <div>{ designTitle }</div>;
};

export default DesignPickerDesignTitle;
