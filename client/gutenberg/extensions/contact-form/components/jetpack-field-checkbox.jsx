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

const JetpackFieldCheckbox = props => {
	return (
		<BaseControl
			id={ `jetpack-field-checkbox-${ props.instanceId }` }
			className="jetpack-field jetpack-field-checkbox"
			label={
				<Fragment>
					<input className="jetpack-field-checkbox__checkbox" type="checkbox" disabled />
					<JetpackFieldLabel
						required={ props.required }
						label={ props.label }
						setAttributes={ props.setAttributes }
						isSelected={ props.isSelected }
					/>
				</Fragment>
			}
		/>
	);
};

export default withInstanceId( JetpackFieldCheckbox );
