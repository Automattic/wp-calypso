/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';

function FormDimensionsInput( {
	className,
	dimensions,
	unit,
	onChange,
	translate,
	noWrap,
} ) {
	const classes = classNames( 'form-dimensions-input', className, { 'no-wrap': noWrap } );

	return (
		<div className={ classes }>
			<FormTextInput
				name="length"
				placeholder={ translate( 'L' ) }
				type="number"
				value={ dimensions && dimensions.length || '' }
				onChange={ onChange }
				className="form-dimensions-input__length"
			/>
			<FormTextInput
				name="width"
				placeholder={ translate( 'W' ) }
				type="number"
				value={ dimensions && dimensions.width || '' }
				onChange={ onChange }
				className="form-dimensions-input__width"
			/>
			<FormTextInputWithAffixes
				name="height"
				placeholder={ translate( 'H' ) }
				suffix={ unit }
				type="number"
				noWrap={ noWrap }
				value={ dimensions && dimensions.height || '' }
				onChange={ onChange }
				className="form-dimensions-input__height"
			/>
		</div>
	);
}

export default localize( FormDimensionsInput );
