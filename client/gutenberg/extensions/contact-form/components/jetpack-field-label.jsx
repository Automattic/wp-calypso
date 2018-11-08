/** @format */

/**
 * External dependencies
 */
import { PlainText } from '@wordpress/editor';
import { ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const JetpackFieldLabel = props => {
	const { setAttributes } = props;
	return (
		<div className="jetpack-field-label">
			<PlainText
				value={ props.label }
				className="jetpack-field-label__input"
				onChange={ label => {
					{
						props.resetFocus && props.resetFocus();
					}
					setAttributes( { label } );
				} }
				placeholder={ __( 'Write label…' ) }
			/>
			{ props.isSelected && (
				<ToggleControl
					label={ __( 'Required' ) }
					className="jetpack-field-label__required"
					checked={ props.required }
					onChange={ required => setAttributes( { required } ) }
				/>
			) }
			{ ! props.isSelected &&
				props.required && <span className="required">{ __( '(required)' ) }</span> }
		</div>
	);
};

export default JetpackFieldLabel;
