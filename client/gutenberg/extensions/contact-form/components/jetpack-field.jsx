/** @format */

/**
 * External dependencies
 */
import { TextControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import JetpackFieldSettings from './jetpack-field-settings';
import JetpackFieldLabel from './jetpack-field-label';

function JetpackField( props ) {
	return (
		<Fragment>
			<JetpackFieldSettings required={ props.required } setAttributes={ props.setAttributes } />
			<div className="jetpack-field">
				<TextControl
					type={ props.type }
					label={
						<JetpackFieldLabel
							required={ props.required }
							label={ props.label }
							setAttributes={ props.setAttributes }
						/>
					}
					disabled
				/>
			</div>
		</Fragment>
	);
}

export default JetpackField;
