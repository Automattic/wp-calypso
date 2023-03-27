import { PremiumBadge } from '@automattic/design-picker';
import { GlobalStylesVariations } from '@automattic/global-styles';
import { translate } from 'i18n-calypso';
import type { StyleVariation } from '@automattic/design-picker/src/types';
import type { GlobalStylesObject } from '@automattic/global-styles/src/types';
import './style.scss';

interface StyleVariationPreviewsProps {
	variations: StyleVariation[];
	selectedVariation?: StyleVariation;
	onClick: ( variation: StyleVariation ) => void;
	showGlobalStylesPremiumBadge: boolean;
}

const StyleVariationPreviews: React.FC< StyleVariationPreviewsProps > = ( {
	variations = [],
	selectedVariation,
	onClick,
	showGlobalStylesPremiumBadge,
} ) => {
	return (
		<GlobalStylesVariations
			globalStylesVariations={ variations as GlobalStylesObject[] }
			selectedGlobalStylesVariation={ selectedVariation as GlobalStylesObject }
			premiumBadge={
				showGlobalStylesPremiumBadge && (
					<PremiumBadge
						className="design-picker__premium-badge"
						labelText={ translate( 'Upgrade' ) }
						tooltipClassName="design-picker__premium-badge-tooltip"
						tooltipPosition="top"
						tooltipContent={ translate(
							'Unlock this style, and tons of other features, by upgrading to a Premium plan.'
						) }
						focusOnShow={ false }
					/>
				)
			}
			onSelect={ ( globalStyleVariation ) => onClick( globalStyleVariation as StyleVariation ) }
		/>
	);
};

export default StyleVariationPreviews;
