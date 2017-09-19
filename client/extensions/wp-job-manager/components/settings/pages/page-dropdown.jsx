/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ReduxFormSelect from 'components/redux-forms/redux-form-select';
import { getSitePosts } from 'state/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

// eslint-disable-next-line no-unused-vars
const PageDropdown = ( { dispatch, name, pages, ...otherProps } ) => {
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

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			pages: ( siteId && getSitePosts( state, siteId ) ) || [],
		};
	}
);

export default connectComponent( PageDropdown );
