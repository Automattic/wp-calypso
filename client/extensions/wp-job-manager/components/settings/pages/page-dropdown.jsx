/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import ReduxFormSelect from 'components/redux-forms/redux-form-select';

const PageDropdown = ( { name, pages, ...otherProps } ) => {
	return (
		<ReduxFormSelect name={ name } { ...otherProps }>
			{ pages.map( ( { ID, title } ) => (
				<option key={ ID } value={ ID }>
					{ title }
				</option>
			) ) }
		</ReduxFormSelect>
	);
};

PageDropdown.propTypes = {
	name: PropTypes.string.isRequired,
	pages: PropTypes.array,
};

export default PageDropdown;
