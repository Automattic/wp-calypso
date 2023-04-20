import { PremiumBadge } from '@automattic/design-picker';
import { translate } from 'i18n-calypso';
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
			<div className="theme__sheet-style-variations-header">
				<h2>
					{ translate( 'Styles' ) }
					<PremiumBadge shouldHideTooltip />
				</h2>
				<p>{ description }</p>
			</div>
			<div className="theme__sheet-style-variations-previews">
				<AsyncLoad
					require="@automattic/design-preview/src/components/style-variation"
					placeholder={ null }
					selectedVariation={ selectedVariation }
					variations={ variations }
					showOnlyHoverViewDefaultVariation
					onClick={ onClick }
				/>
			</div>
		</div>
	);
};

export default ThemeStyleVariations;
