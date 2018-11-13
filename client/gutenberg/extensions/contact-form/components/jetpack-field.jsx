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

function JetpackField( { isSelected, type, required, label, setAttributes } ) {
	return (
		<Fragment>
			<div className={ classNames( 'jetpack-field', { 'is-selected': isSelected } ) }>
				<TextControl
					type={ type }
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

export default JetpackField;
