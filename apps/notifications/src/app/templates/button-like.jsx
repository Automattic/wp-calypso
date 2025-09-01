import { __ } from '@wordpress/i18n';
import { thumbsUp } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { keys } from '../../panel/helpers/input';
import { getReferenceId } from '../../panel/helpers/notes';
import { setLikeStatus } from '../../panel/state/notes/thunks/index';
import { useAppContext } from '../context';
import ActionButton from './action-button';

// eslint-disable-next-line no-shadow
const LikeButton = ( { commentId, isLiked, note, setLikeStatus } ) => {
	const { client } = useAppContext();

	let title;

	if ( isLiked ) {
		if ( commentId ) {
			title = __( 'Remove like from comment' );
		} else {
			title = __( 'Remove like from post' );
		}
	} else if ( commentId ) {
		title = __( 'Like comment' );
	} else {
		title = __( 'Like post' );
	}

	return (
		<ActionButton
			icon={ thumbsUp }
			isActive={ isLiked }
			hotkey={ keys.KEY_L }
			onToggle={ () =>
				setLikeStatus(
					note.id,
					getReferenceId( note, 'site' ),
					getReferenceId( note, 'post' ),
					getReferenceId( note, 'comment' ),
					! isLiked,
					client
				)
			}
			text={ isLiked ? __( 'Liked' ) : __( 'Like' ) }
			title={ title }
		/>
	);
};

LikeButton.propTypes = {
	commentId: PropTypes.number,
	isLiked: PropTypes.bool.isRequired,
	note: PropTypes.object.isRequired,
};

export default connect( null, { setLikeStatus } )( LikeButton );
