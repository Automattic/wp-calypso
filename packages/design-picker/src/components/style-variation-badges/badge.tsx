import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { getStylesColorFromVariation } from './utils';
import type { StyleVariation } from '../../types';
import './style.scss';

const SPACE_BAR_KEYCODE = 32;

interface BadgeProps {
	variation: StyleVariation;
	onClick?: ( variation: StyleVariation ) => void;
}

const Badge: React.FC< BadgeProps > = ( { variation, onClick } ) => {
	const { __ } = useI18n();
	const color = useMemo(
		() => variation && getStylesColorFromVariation( variation ),
		[ variation ]
	);

	if ( ! color ) {
		return null;
	}

	return (
		<div
			className="style-variation__badge-wrapper"
			tabIndex={ 0 }
			role="button"
			aria-label={
				variation.title
					? // translators: %(title)s - the style variation title.
					  sprintf( __( 'Style: %(title)s' ), { title: variation.title } )
					: __( 'Preview with this style' )
			}
			onClick={ ( e ) => {
				// Prevent the event from bubbling to the the parent button.
				e.stopPropagation();
				onClick?.( variation );
			} }
			onKeyDown={ ( e ) => {
				if ( e.keyCode === SPACE_BAR_KEYCODE ) {
					// Prevent the event from bubbling to the the parent button.
					e.stopPropagation();
					onClick?.( variation );
				}
			} }
		>
			<span style={ { background: color.background } } />
		</div>
	);
};

export default Badge;
