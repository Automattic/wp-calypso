import AsyncLoad from 'calypso/components/async-load';
import type { StyleVariation } from '@automattic/design-picker/src/types';
import type { TranslateResult } from 'i18n-calypso';
import './style.scss';

interface ThemeStyleVariationsProps {
	description: TranslateResult;
	selectedVariation: StyleVariation;
	variations: StyleVariation[];
	splitDefaultVariation: boolean;
	needsUpgrade: boolean;
	onClick: ( variation: StyleVariation ) => void;
}

const ThemeStyleVariations = ( {
	description,
	selectedVariation,
	variations,
	splitDefaultVariation,
	needsUpgrade,
	onClick,
}: ThemeStyleVariationsProps ) => {
	return (
		<div className="theme__sheet-style-variations">
			{ !! description && <p>{ description }</p> }

			<div className="theme__sheet-style-variations-previews">
				<AsyncLoad
					require="@automattic/global-styles/src/components/global-styles-variations"
					placeholder={ null }
					globalStylesVariations={ variations }
					selectedGlobalStylesVariation={ selectedVariation }
					splitDefaultVariation={ splitDefaultVariation }
					displayFreeLabel={ splitDefaultVariation }
					showOnlyHoverViewDefaultVariation={ false }
					needsUpgrade={ needsUpgrade }
					onSelect={ onClick }
				/>
			</div>
		</div>
	);
};

export default ThemeStyleVariations;
