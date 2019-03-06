/**
 * External dependencies
 */
import { PlainText } from '@wordpress/editor';
import { ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from '../../../utils/i18n';

const JetpackFieldLabel = ( { setAttributes, label, resetFocus, isSelected, required } ) => {
	return (
		<div className="jetpack-field-label">
			<PlainText
				value={ label }
				className="jetpack-field-label__input"
				onChange={ value => {
					resetFocus && resetFocus();
					setAttributes( { label: value } );
				} }
				placeholder={ __( 'Write label…' ) }
			/>
			{ isSelected && (
				<ToggleControl
					label={ __( 'Required' ) }
					className="jetpack-field-label__required"
					checked={ required }
					onChange={ value => setAttributes( { required: value } ) }
				/>
			) }
			{ ! isSelected && required && <span className="required">{ __( '(required)' ) }</span> }
		</div>
	);
};

export default JetpackFieldLabel;
