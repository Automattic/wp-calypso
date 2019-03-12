/**
 * External dependencies
 */
import { BaseControl, PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { withInstanceId } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import JetpackFieldLabel from './jetpack-field-label';
import { __ } from '../../../utils/i18n';

const JetpackFieldCheckbox = ( {
	instanceId,
	required,
	label,
	setAttributes,
	isSelected,
	defaultValue,
	id,
} ) => {
	return (
		<BaseControl
			id={ `jetpack-field-checkbox-${ instanceId }` }
			className="jetpack-field jetpack-field-checkbox"
			label={
				<Fragment>
					<input
						className="jetpack-field-checkbox__checkbox"
						type="checkbox"
						disabled
						checked={ defaultValue }
					/>
					<JetpackFieldLabel
						required={ required }
						label={ label }
						setAttributes={ setAttributes }
						isSelected={ isSelected }
					/>
					<InspectorControls>
						<PanelBody title={ __( 'Field Settings' ) }>
							<ToggleControl
								label={ __( 'Default Checked State' ) }
								checked={ defaultValue }
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
			}
		/>
	);
};

export default withInstanceId( JetpackFieldCheckbox );
