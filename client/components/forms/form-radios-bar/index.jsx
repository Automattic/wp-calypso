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

const FormRadiosBar = ( { isThumbnail, checked, onChange, items } ) => {
	const addProps = ( Component, item, key ) =>
		<Component key={ key } checked={ checked === item.value } onChange={ onChange } { ...item } />;

	return (
		<div className={ classnames( 'form-radios-bar', { 'is-thumbnail': isThumbnail } ) }>
			{ items.map(
				( item, i ) =>
					isThumbnail
						? addProps( FormRadioWithThumbnail, item, i )
						: <FormLabel key={ i }>
								{ addProps( FormRadio, item, i ) }
								<span>
									{ item.label }
								</span>
							</FormLabel>
			) }
		</div>
	);
};

FormRadiosBar.propTypes = {
	isThumbnail: PropTypes.bool,
	checked: PropTypes.string,
	onChange: PropTypes.func,
	items: PropTypes.array,
};

export default FormRadiosBar;
