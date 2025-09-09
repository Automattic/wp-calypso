import { __ } from '@wordpress/i18n';
import { edit } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getEditCommentLink } from '../../panel/helpers/notes';
import { editComment } from '../../panel/state/ui/actions';
import ActionButton from './action-button';

// eslint-disable-next-line no-shadow
const EditButton = ( { editComment, note } ) => {
	const { site: siteId, post: postId, comment: commentId } = note?.meta?.ids ?? {};
	return (
		<ActionButton
			icon={ edit }
			isActive={ false }
			hotkey="e"
			onToggle={ () => editComment( siteId, postId, commentId, getEditCommentLink( note ) ) }
			text={ __( 'Edit' ) }
			title={ __( 'Edit comment' ) }
		/>
	);
};

EditButton.propTypes = {
	editComment: PropTypes.func.isRequired,
	note: PropTypes.object.isRequired,
};

export default connect( null, { editComment } )( EditButton );
