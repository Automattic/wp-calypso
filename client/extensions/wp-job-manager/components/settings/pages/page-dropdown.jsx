/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ReduxFormSelect from 'components/redux-forms/redux-form-select';

const PageDropdown = ( { disabled, name, pages } ) => {
	return (
		<ReduxFormSelect disabled={ disabled } name={ name }>
			{ pages.map( ( { id, title } ) => (
				<option key={ id } value={ id }>
					{ get( title, 'rendered', '' ) }
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
