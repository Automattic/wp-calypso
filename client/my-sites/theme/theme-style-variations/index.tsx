import AsyncLoad from 'calypso/components/async-load';
import type { StyleVariation } from '@automattic/design-picker/src/types';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

interface ThemeStyleVariationsProps {
	description: TranslateResult;
	selectedVariation: StyleVariation;
	variations: StyleVariation[];
	onClick: ( variation: StyleVariation ) => void;
}

const ThemeStyleVariations = ( {
	description,
	selectedVariation,
	variations,
	onClick,
}: ThemeStyleVariationsProps ) => {
	return (
		<div className="theme__sheet-style-variations">
			<p>{ description }</p>

			<div className="theme__sheet-style-variations-previews">
				<AsyncLoad
					require="@automattic/design-preview/src/components/style-variation"
					placeholder={ null }
					selectedVariation={ selectedVariation }
					description={ description }
					variations={ variations }
					showOnlyHoverViewDefaultVariation
					onClick={ onClick }
				/>
			</div>
		</div>
	);
};

export default ThemeStyleVariations;
