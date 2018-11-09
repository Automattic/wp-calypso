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

function JetpackFieldTextarea( { required, label, setAttributes, isSelected } ) {
	return (
		<Fragment>
			<div className="jetpack-field">
				<TextareaControl
					label={
						<JetpackFieldLabel
							required={ required }
							label={ label }
							setAttributes={ setAttributes }
							isSelected={ isSelected }
						/>
					}
					disabled
				/>
			</div>
		</Fragment>
	);
}

export default JetpackFieldTextarea;
