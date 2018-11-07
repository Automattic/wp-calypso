/** @format */

/**
 * External dependencies
 */
import { Fragment } from '@wordpress/element';
import { PlainText } from '@wordpress/editor';
import { ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const JetpackFieldLabel = props => {
	const { setAttributes } = props;
	return (
		<Fragment>
			<PlainText
				value={ props.label }
				className="jetpack-field-label"
				onChange={ label => setAttributes( { label } ) }
				placeholder={ __( 'Type label…' ) }
			/>
			{ props.isSelected && (
				<ToggleControl
					label={ __( 'Required' ) }
					checked={ props.required }
					onChange={ required => setAttributes( { required } ) }
				/>
			) }
			{ ! props.isSelected &&
				props.required && <span className="required">{ __( '(required)' ) }</span> }
		</Fragment>
	);
};

export default JetpackFieldLabel;
