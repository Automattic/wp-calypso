import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useMemo } from 'react';
import { getStylesColorFromVariation } from './utils';
import type { StyleVariation } from '../../types';
import './style.scss';

const SPACE_BAR_KEYCODE = 32;

interface BadgeProps {
	variation: StyleVariation;
	onClick?: ( variation: StyleVariation ) => void;
	isSelected?: boolean;
}

const Badge: React.FC< BadgeProps > = ( { variation, onClick, isSelected } ) => {
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
			className={ classnames( 'style-variation__badge-wrapper', {
				'style-variation__badge-is-selected': isSelected,
			} ) }
			tabIndex={ 0 }
			role="button"
			aria-label={
				variation.title
					? // translators: %(title)s - the style variation title.
					  sprintf( __( 'Style: %(title)s' ), { title: variation.title } )
					: __( 'Preview with this style' )
			}
			onClick={ ( e ) => {
				if ( isSelected ) {
					return;
				}
				// Prevent the event from bubbling to the parent button.
				e.stopPropagation();
				onClick?.( variation );
			} }
			onKeyDown={ ( e ) => {
				if ( isSelected ) {
					return;
				}
				if ( e.keyCode === SPACE_BAR_KEYCODE ) {
					// Prevent the event from bubbling to the parent button.
					e.stopPropagation();
					onClick?.( variation );
				}
			} }
		>
			<span
				style={ {
					background: `linear-gradient(
							to right,
							${ color.background } 0 50%,
							${ color.text } 50% 100%)`,
				} }
			/>
		</div>
	);
};

export default Badge;
