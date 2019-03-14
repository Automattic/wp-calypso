/**
 * External dependencies
 */
import { TextControl, PanelBody } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import classNames from 'classnames';
import { InspectorControls } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import JetpackFieldLabel from './jetpack-field-label';
import { __ } from '../../../utils/i18n';

function JetpackField( {
	isSelected,
	type,
	required,
	label,
	setAttributes,
	defaultValue,
	placeholder,
	id,
} ) {
	return (
		<Fragment>
			<div className={ classNames( 'jetpack-field', { 'is-selected': isSelected } ) }>
				<TextControl
					type={ type }
					label={
						<JetpackFieldLabel
							required={ required }
							label={ label }
							setAttributes={ setAttributes }
							isSelected={ isSelected }
						/>
					}
					placeholder={ placeholder }
					value={ placeholder }
					onChange={ value => setAttributes( { placeholder: value } ) }
					title={ __( 'Set the placeholder text' ) }
				/>
			</div>
			<InspectorControls>
				<PanelBody title={ __( 'Field Settings' ) }>
					<TextControl
						label={ __( 'Default Value' ) }
						value={ defaultValue }
						onChange={ value => setAttributes( { defaultValue: value } ) }
					/>
					<TextControl
						label={ __( 'ID' ) }
						value={ id }
						onChange={ value => setAttributes( { id: value } ) }
					/>
				</PanelBody>
			</InspectorControls>
		</Fragment>
	);
}

export default JetpackField;
