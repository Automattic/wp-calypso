/** @format */

/**
 * External dependencies
 */
import { BaseControl, CheckboxControl } from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import JetpackFieldSettings from './jetpack-field-settings';
import JetpackFieldLabel from './jetpack-field-label';

const JetpackFieldCheckbox = props => {
	return (
		<Fragment>
			<JetpackFieldSettings required={ props.required } setAttributes={ props.setAttributes } />
			<BaseControl id={ `jetpack-field-checkbox-${ props.instanceId }` } className="jetpack-field">
				<CheckboxControl
					id={ `jetpack-field-checkbox-${ props.instanceId }` }
					label={
						<JetpackFieldLabel
							required={ props.required }
							label={ props.label }
							setAttributes={ props.setAttributes }
						/>
					}
					disabled
				/>
			</BaseControl>
		</Fragment>
	);
};

export default withInstanceId( JetpackFieldCheckbox );
