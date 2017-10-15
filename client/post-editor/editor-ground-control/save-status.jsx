/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import postUtils from 'lib/posts/utils';

// First, validate that the post had an ID, presumably this
// allows us to determine whether or not it is stored as a draft.
// More semantic way to express this??
const isPostNotYetPublished = post => get( post, 'ID' ) && ! postUtils.isPublished( post );

const SaveStatus = ( { isSaveAvailable, isSaving, onClick, post, translate } ) => {
	const shouldShowStatusLabel = isSaveAvailable || isSaving || isPostNotYetPublished( post );

	if ( ! shouldShowStatusLabel ) {
		return null;
	}

	return (
		<div className="editor-ground-control__status">
			{ isSaveAvailable ? (
				<button className="editor-ground-control__save button is-link" onClick={ onClick }>
					{ translate( 'Save' ) }
				</button>
			) : (
				<span
					className="editor-ground-control__save-status"
					data-e2e-status={ isSaving ? 'Saving…' : 'Saved' }
				>
					{ isSaving ? translate( 'Saving…' ) : translate( 'Saved' ) }
				</span>
			) }
		</div>
	);
};

SaveStatus.propTypes = {
	isSaveAvailable: PropTypes.bool,
	isSaving: PropTypes.bool,
	post: PropTypes.object,
	translate: PropTypes.func,
};

SaveStatus.defaultProps = {
	onClick: noop,
};

export default localize( SaveStatus );
