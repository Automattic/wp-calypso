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
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormRadioWithThumbnail from 'components/forms/form-radio-with-thumbnail';

/**
 * Style dependencies
 */
import './style.scss';

const FormRadiosBar = ( { isThumbnail, checked, onChange, items } ) => {
	return (
		<div className={ classnames( 'form-radios-bar', { 'is-thumbnail': isThumbnail } ) }>
			{ items.map( ( item, i ) =>
				isThumbnail ? (
					<FormRadioWithThumbnail
						key={ item.value + i }
						checked={ checked === item.value }
						onChange={ onChange }
						{ ...item }
					/>
				) : (
					<FormLabel key={ item.value + i }>
						<FormRadio checked={ checked === item.value } onChange={ onChange } { ...item } />
						<span>{ item.label }</span>
					</FormLabel>
				)
			) }
		</div>
	);
};

FormRadiosBar.propTypes = {
	isThumbnail: PropTypes.bool,
	checked: PropTypes.string,
	onChange: PropTypes.func,
	items: PropTypes.array.isRequired,
};

export default FormRadiosBar;
