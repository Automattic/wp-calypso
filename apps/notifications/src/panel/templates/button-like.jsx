import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { connect } from 'react-redux';
import { RestClientContext } from '../Notifications';
import { keys } from '../helpers/input';
import { getReferenceId } from '../helpers/notes';
import { setLikeStatus } from '../state/notes/thunks/index';
import ActionButton from './action-button';

// eslint-disable-next-line no-shadow
const LikeButton = ( { commentId, isLiked, note, translate, setLikeStatus } ) => {
	const restClient = useContext( RestClientContext );

	let title;

	if ( isLiked ) {
		if ( commentId ) {
			title = translate( 'Remove like from comment' );
		} else {
			title = translate( 'Remove like from post' );
		}
	} else if ( commentId ) {
		title = translate( 'Like comment', { context: 'verb: imperative' } );
	} else {
		title = translate( 'Like post', { context: 'verb: imperative' } );
	}

	return (
		<ActionButton
			icon="star"
			isActive={ isLiked }
			hotkey={ keys.KEY_L }
			onToggle={ () =>
				setLikeStatus(
					note.id,
					getReferenceId( note, 'site' ),
					getReferenceId( note, 'post' ),
					getReferenceId( note, 'comment' ),
					! isLiked,
					restClient
				)
			}
			text={
				isLiked
					? translate( 'Liked', { context: 'verb: past-tense' } )
					: translate( 'Like', { context: 'verb: imperative' } )
			}
			title={ title }
		/>
	);
};

LikeButton.propTypes = {
	commentId: PropTypes.number,
	isLiked: PropTypes.bool.isRequired,
	note: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect( null, { setLikeStatus } )( localize( LikeButton ) );
