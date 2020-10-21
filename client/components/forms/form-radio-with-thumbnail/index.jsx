/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import FormRadio from 'calypso/components/forms/form-radio';
import FormLabel from 'calypso/components/forms/form-label';
import TranslatableString from 'calypso/components/translatable/proptype';

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
				<FormRadio label={ label } { ...otherProps } />
			</FormLabel>
		</div>
	);
};

FormRadioWithThumbnail.propTypes = {
	label: TranslatableString,
	thumbnail: PropTypes.object.isRequired,
};

export default FormRadioWithThumbnail;
