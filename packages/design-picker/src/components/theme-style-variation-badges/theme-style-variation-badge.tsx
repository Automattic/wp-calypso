import { useMemo } from 'react';
import { getPreviewStylesFromVariation } from './utils';
import type { ThemeStyleVariation } from '../../types';
import './style.scss';

interface ThemeStyleVariationBadgeProps {
	variation?: ThemeStyleVariation;
}

const ThemeStyleVariationBadge: React.FC< ThemeStyleVariationBadgeProps > = ( { variation } ) => {
	const styles = useMemo(
		() => variation && getPreviewStylesFromVariation( variation ),
		[ variation ]
	);

	if ( ! styles ) {
		return null;
	}

	return (
		<div className="theme-style-variation-wrapper">
			<span
				style={ {
					backgroundColor: styles.color.background,
					color: styles.color.primary,
				} }
			>
				A
			</span>
		</div>
	);
};

export default ThemeStyleVariationBadge;
