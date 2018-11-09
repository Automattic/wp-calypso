/** @format */

/**
 * External dependencies
 */
import { TextControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import JetpackFieldLabel from './jetpack-field-label';

function JetpackField( props ) {
	return (
		<Fragment>
			<div className={ classNames( 'jetpack-field', { 'is-selected': props.isSelected } ) }>
				<TextControl
					type={ props.type }
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

export default JetpackField;
