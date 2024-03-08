import { type Design } from '@automattic/design-picker';
import ThemeTierBadge from 'calypso/components/theme-tier/theme-tier-badge';
import type { FC } from 'react';

import './design-picker-design-title.scss';

type Props = {
	designTitle: string;
	selectedDesign: Design;
};

const DesignPickerDesignTitle: FC< Props > = ( { designTitle, selectedDesign } ) => (
	<div className="design-picker-design-title__container">
		{ designTitle }
		<ThemeTierBadge
			className="design-picker-design-title__theme-tier-badge"
			isLockedStyleVariation={ false }
			themeId={ selectedDesign.slug }
		/>
	</div>
);

export default DesignPickerDesignTitle;
