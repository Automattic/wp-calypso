/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import FormRadio from 'components/forms/form-radio';
import FormLabel from 'components/forms/form-label';
import TranslatableString from 'components/translatable/proptype';

/**
 * Style dependencies
 */
import './style.scss';

const FormRadioWithThumbnail = ( { label, thumbnail, ...otherProps } ) => {
	const { cssClass, cssColor, imageUrl } = thumbnail;

	return (
		<div className="form-radio-with-thumbnail">
			<FormLabel>
				<div
					className={ classnames( 'form-radio-with-thumbnail__thumbnail', cssClass ) }
					style={ { backgroundColor: cssColor } }
				>
					{ imageUrl && <img src={ imageUrl } alt={ label } /> }
				</div>
				<FormRadio { ...otherProps } />
				<span>{ label }</span>
			</FormLabel>
		</div>
	);
};

FormRadioWithThumbnail.propTypes = {
	label: TranslatableString,
	thumbnail: PropTypes.object.isRequired,
};

export default FormRadioWithThumbnail;
