import { GlobalStylesVariations } from '@automattic/global-styles';
import type { StyleVariation } from '@automattic/design-picker/src/types';
import './style.scss';

interface StyleVariationPreviewsProps {
	variations: StyleVariation[];
	selectedVariation?: StyleVariation;
	onClick: ( variation: StyleVariation ) => void;
	showGlobalStylesPremiumBadge: boolean;
	showOnlyHoverViewDefaultVariation?: boolean;
}

const StyleVariationPreviews: React.FC< StyleVariationPreviewsProps > = ( {
	variations = [],
	selectedVariation,
	onClick,
	showGlobalStylesPremiumBadge,
	showOnlyHoverViewDefaultVariation,
} ) => {
	return (
		<GlobalStylesVariations
			globalStylesVariations={ variations }
			selectedGlobalStylesVariation={ selectedVariation }
			onSelect={ onClick }
			showGlobalStylesPremiumBadge={ showGlobalStylesPremiumBadge }
			showOnlyHoverViewDefaultVariation={ showOnlyHoverViewDefaultVariation }
		/>
	);
};

export default StyleVariationPreviews;
