/** @format */

/**
 * External dependencies
 */
import { TextareaControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import JetpackFieldLabel from './jetpack-field-label';

function JetpackFieldTextarea( props ) {
	return (
		<Fragment>
			<div className="jetpack-field">
				<TextareaControl
					label={
						<JetpackFieldLabel
							required={ props.required }
							label={ props.label }
							setAttributes={ props.setAttributes }
							isSelected={ props.isSelected }
						/>
					}
					disabled
				/>
			</div>
		</Fragment>
	);
}

export default JetpackFieldTextarea;
