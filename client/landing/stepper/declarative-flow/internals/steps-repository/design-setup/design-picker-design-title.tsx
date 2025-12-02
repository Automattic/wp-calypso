import { type Design } from '@automattic/design-picker';
import ThemeTierBadge from 'calypso/components/theme-tier/theme-tier-badge';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import type { FC } from 'react';

import './design-picker-design-title.scss';

type Props = {
	designTitle: string;
	selectedDesign: Design;
	siteId: number | null;
	siteSlug: string | null;
};

const DesignPickerDesignTitle: FC< Props > = ( {
	designTitle,
	selectedDesign,
	siteId,
	siteSlug,
} ) => {
	const { data: siteActiveTheme } = useActiveThemeQuery( siteId ?? 0, !! siteId );

	const isActive =
		selectedDesign.slug === siteActiveTheme?.[ 0 ]?.stylesheet?.replace( /pub\/|premium\//, '' );

	return (
		<div className="design-picker-design-title__container">
			<span className="design-picker-design-title__design-title">{ designTitle }</span>
			<ThemeTierBadge
				className="design-picker-design-title__theme-tier-badge"
				isLockedStyleVariation={ false }
				themeId={ selectedDesign.slug }
				showPartnerPrice
				siteId={ siteId }
				siteSlug={ siteSlug }
				// Design picker shouldn't include retired themes.
				isThemeRetired={ false }
				isThemeActiveForSite={ isActive }
			/>
		</div>
	);
};

export default DesignPickerDesignTitle;
