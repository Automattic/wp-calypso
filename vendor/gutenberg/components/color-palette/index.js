/**
 * External dependencies
 */
import classnames from 'classnames';
import { ChromePicker } from 'react-color';
import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import Dropdown from '../dropdown';
import Tooltip from '../tooltip';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';
import Button from '../button';

export default function ColorPalette( { colors, disableCustomColors = false, value, onChange } ) {
	function applyOrUnset( color ) {
		return () => onChange( value === color ? undefined : color );
	}
	const customColorPickerLabel = __( 'Custom color picker' );
	return (
		<div className="components-color-palette">
			{ map( colors, ( { color, name } ) => {
				const style = { color: color };
				const className = classnames( 'components-color-palette__item', { 'is-active': value === color } );

				return (
					<div key={ color } className="components-color-palette__item-wrapper">
						<Tooltip
							text={ name ||
								// translators: %s: color hex code e.g: "#f00".
								sprintf( __( 'Color code: %s' ), color )
							}>
							<button
								type="button"
								className={ className }
								style={ style }
								onClick={ applyOrUnset( color ) }
								aria-label={ name ?
									// translators: %s: The name of the color e.g: "vivid red".
									sprintf( __( 'Color: %s' ), name ) :
									// translators: %s: color hex code e.g: "#f00".
									sprintf( __( 'Color code: %s' ), color ) }
								aria-pressed={ value === color }
							/>
						</Tooltip>
					</div>
				);
			} ) }

			{ ! disableCustomColors &&
				<Dropdown
					className="components-color-palette__item-wrapper components-color-palette__custom-color"
					contentClassName="components-color-palette__picker"
					renderToggle={ ( { isOpen, onToggle } ) => (
						<Tooltip text={ customColorPickerLabel }>
							<button
								type="button"
								aria-expanded={ isOpen }
								className="components-color-palette__item"
								onClick={ onToggle }
								aria-label={ customColorPickerLabel }
							>
								<span className="components-color-palette__custom-color-gradient" />
							</button>
						</Tooltip>
					) }
					renderContent={ () => (
						<ChromePicker
							color={ value }
							onChangeComplete={ ( color ) => onChange( color.hex ) }
							disableAlpha
						/>
					) }
				/>
			}

			<Button
				className="components-color-palette__clear"
				type="button"
				onClick={ () => onChange( undefined ) }
				isLink
			>
				{ __( 'Clear' ) }
			</Button>
		</div>
	);
}
