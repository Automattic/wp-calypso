import { useMemo } from 'react';
import { getPreviewStylesFromVariation } from './utils';
import type { StyleVariation } from '../../types';
import './style.scss';

const SPACE_BAR_KEYCODE = 32;

interface BadgeProps {
	variation: StyleVariation;
	onClick?: ( variation: StyleVariation ) => void;
}

const Badge: React.FC< BadgeProps > = ( { variation, onClick } ) => {
	const styles = useMemo(
		() => variation && getPreviewStylesFromVariation( variation ),
		[ variation ]
	);

	if ( ! styles ) {
		return null;
	}

	return (
		<div
			className="style-variation__badge-wrapper"
			tabIndex={ 0 }
			role="button"
			onClick={ ( e ) => {
				e.stopPropagation();
				onClick?.( variation );
			} }
			onKeyDown={ ( e ) => {
				if ( e.keyCode === SPACE_BAR_KEYCODE ) {
					e.stopPropagation();
					onClick?.( variation );
				}
			} }
		>
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
