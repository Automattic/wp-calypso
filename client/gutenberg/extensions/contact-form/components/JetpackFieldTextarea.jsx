/*global wp*/
/** @jsx wp.element.createElement */
/** @format */

/**
 * External dependencies
 */
import {
	TextareaControl
} from '@wordpress/components';

import {
	Fragment
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import JetpackFieldSettings from './JetpackFieldSettings';
import JetpackFieldLabel from './JetpackFieldLabel';

function JetpackFieldTextarea( props ) {
	return (
		<Fragment>
			<JetpackFieldSettings
				required={ props.required }
				setAttributes={ props.setAttributes }
			/>
			<div className="jetpack-field">
				<TextareaControl
					label={ <JetpackFieldLabel
						required={ props.required }
						label={ props.label }
						setAttributes={ props.setAttributes }
					/> }
					disabled
				/>
			</div>
		</Fragment>
	);
}

export default JetpackFieldTextarea;
