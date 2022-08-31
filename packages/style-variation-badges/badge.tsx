import { useMemo } from 'react';
import { getPreviewStylesFromVariation } from './utils';
import type { StyleVariation } from '../../types';
import './style.scss';

interface BadgeProps {
	variation?: StyleVariation;
}

const Badge: React.FC< BadgeProps > = ( { variation } ) => {
	const styles = useMemo(
		() => variation && getPreviewStylesFromVariation( variation ),
		[ variation ]
	);

	if ( ! styles ) {
		return null;
	}

	return (
		<div className="style-variation__badge-wrapper">
			<span
				style={ {
					backgroundColor: styles.color.background,
					color: styles.color.foreground,
				} }
			>
				A
			</span>
		</div>
	);
};

export default Badge;
