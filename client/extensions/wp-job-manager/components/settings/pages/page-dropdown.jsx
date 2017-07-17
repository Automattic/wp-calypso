/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import ReduxFormSelect from 'components/redux-forms/redux-form-select';

const PageDropdown = ( { disabled, name, pages } ) => {
	return (
		<ReduxFormSelect disabled={ disabled } name={ name }>
			{ pages.map( ( { ID, title } ) => (
				<option key={ ID } value={ ID }>
					{ title }
				</option>
			) ) }
		</ReduxFormSelect>
	);
};

PageDropdown.propTypes = {
	name: PropTypes.string,
	pages: PropTypes.array,
};

export default PageDropdown;
