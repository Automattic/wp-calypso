/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { setLikeStatus } from '../state/notes/thunks/index';
import ActionButton from './action-button';
import { keys } from '../helpers/input';
import { getReferenceId } from '../helpers/notes';
import { RestClientContext } from '../Notifications';

const LikeButton = ( { commentId, isLiked, note, translate, setLikeStatus } ) => {
	const restClient = useContext( RestClientContext );

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
			title={
				isLiked
					? commentId
						? translate( 'Remove like from comment' )
						: translate( 'Remove like from post' )
					: commentId
					? translate( 'Like comment', { context: 'verb: imperative' } )
					: translate( 'Like post', { context: 'verb: imperative' } )
			}
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
