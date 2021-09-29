import classnames from 'classnames';
import PropTypes from 'prop-types';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import TranslatableString from 'calypso/components/translatable/proptype';

import './style.scss';

const FormRadioWithThumbnail = ( { label, thumbnail, disabled, ...otherProps } ) => {
	const { cssClass, cssColor, imageUrl } = thumbnail;

	return (
		<div className="form-radio-with-thumbnail">
			<FormLabel>
				<div
					className={ classnames( 'form-radio-with-thumbnail__thumbnail', cssClass ) }
					style={ { backgroundColor: cssColor, opacity: disabled ? 0.5 : 1 } }
				>
					{ imageUrl && <img src={ imageUrl } alt={ label } /> }
				</div>
				<FormRadio label={ label } disabled={ disabled } { ...otherProps } />
			</FormLabel>
		</div>
	);
};

FormRadioWithThumbnail.propTypes = {
	label: TranslatableString,
	thumbnail: PropTypes.object.isRequired,
};

export default FormRadioWithThumbnail;
