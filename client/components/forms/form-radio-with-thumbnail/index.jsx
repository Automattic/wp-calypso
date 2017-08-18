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
import cssSafeUrl from 'lib/css-safe-url';

const FormRadioWithThumbnail = ( { label, thumbnail, ...otherProps } ) => {
	const { cssClass, cssColor, imageUrl } = thumbnail;
	const styles = {
		backgroundColor: cssColor,
		backgroundImage: imageUrl ? 'url(' + cssSafeUrl( imageUrl ) + ')' : '',
	};

	return (
		<div className="form-radio-with-thumbnail">
			<FormLabel>
				<div
					className={ classnames( 'form-radio-with-thumbnail__thumbnail', cssClass ) }
					style={ styles }
				/>
				<FormRadio { ...otherProps } />
				<span>
					{ label }
				</span>
			</FormLabel>
		</div>
	);
};

FormRadioWithThumbnail.propTypes = {
	label: PropTypes.string,
	thumbnail: PropTypes.object.isRequired,
};

export default FormRadioWithThumbnail;
