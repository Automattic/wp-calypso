/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ActionButton from './action-button';
import { keys } from '../helpers/input';
import { getEditCommentLink } from '../helpers/notes';
import { editComment } from '../state/ui/actions';

const EditButton = ( { editComment, note, translate } ) => {
	const { site: siteId, post: postId, comment: commentId } = get( note, 'meta.ids', {} );
	return (
		<ActionButton
			{ ...{
				icon: 'pencil',
				isActive: false,
				hotkey: keys.KEY_E,
				onToggle: () => editComment( siteId, postId, commentId, getEditCommentLink( note ) ),
				text: translate( 'Edit', { context: 'verb: imperative' } ),
				title: translate( 'Edit comment', { context: 'verb: imperative' } ),
			} }
		/>
	);
};

EditButton.propTypes = {
	editComment: PropTypes.func.isRequired,
	note: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect( null, { editComment } )( localize( EditButton ) );
