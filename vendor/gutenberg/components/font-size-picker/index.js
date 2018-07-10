/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';
import Button from '../button';
import ButtonGroup from '../button-group';
import RangeControl from '../range-control';

export default function FontSizePicker( { fontSizes = [], fallbackFontSize, value, onChange } ) {
	return (
		<Fragment>
			<div className="components-font-size-picker__buttons">
				<ButtonGroup aria-label={ __( 'Font Size' ) }>
					{ map( fontSizes, ( { name, size, shortName } ) => (
						<Button
							key={ size }
							isLarge
							isPrimary={ value === size }
							aria-pressed={ value === size }
							onClick={ () => onChange( size ) }
						>
							{ shortName || name }
						</Button>
					) ) }
				</ButtonGroup>
				<Button
					isLarge
					onClick={ () => onChange( undefined ) }
				>
					{ __( 'Reset' ) }
				</Button>
			</div>
			<RangeControl
				className="components-font-size-picker__custom-input"
				label={ __( 'Custom Size' ) }
				value={ value || '' }
				initialPosition={ fallbackFontSize }
				onChange={ onChange }
				min={ 12 }
				max={ 100 }
				beforeIcon="editor-textcolor"
				afterIcon="editor-textcolor"
			/>
		</Fragment>
	);
}
