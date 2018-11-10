/** @format */

/**
 * External dependencies
 */
import { BaseControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { withInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import JetpackFieldLabel from './jetpack-field-label';

const JetpackFieldCheckbox = ( { instanceId, required, label, setAttributes, isSelected } ) => {
	return (
		<BaseControl
			id={ `jetpack-field-checkbox-${ instanceId }` }
			className="jetpack-field jetpack-field-checkbox"
			label={
				<Fragment>
					<input className="jetpack-field-checkbox__checkbox" type="checkbox" disabled />
					<JetpackFieldLabel
						required={ required }
						label={ label }
						setAttributes={ setAttributes }
						isSelected={ isSelected }
					/>
				</Fragment>
			}
		/>
	);
};

export default withInstanceId( JetpackFieldCheckbox );
