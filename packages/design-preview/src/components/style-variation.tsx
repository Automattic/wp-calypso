import { GlobalStylesVariations } from '@automattic/global-styles';
import { TranslateResult } from 'i18n-calypso';
import type { StyleVariation } from '@automattic/design-picker/src/types';
import type { GlobalStylesObject } from '@automattic/global-styles/src/types';
import './style.scss';

interface StyleVariationPreviewsProps {
	variations: StyleVariation[];
	selectedVariation?: StyleVariation;
	onClick: ( variation: StyleVariation ) => void;
	description?: TranslateResult;
	showOnlyHoverViewDefaultVariation?: boolean;
}

const StyleVariationPreviews: React.FC< StyleVariationPreviewsProps > = ( {
	variations = [],
	selectedVariation,
	onClick,
	description,
	showOnlyHoverViewDefaultVariation,
} ) => {
	return (
		<GlobalStylesVariations
			globalStylesVariations={ variations as GlobalStylesObject[] }
			selectedGlobalStylesVariation={ selectedVariation as GlobalStylesObject }
			description={ description }
			showOnlyHoverViewDefaultVariation={ showOnlyHoverViewDefaultVariation }
			onSelect={ ( globalStyleVariation: GlobalStylesObject ) =>
				onClick( globalStyleVariation as StyleVariation )
			}
		/>
	);
};

export default StyleVariationPreviews;
