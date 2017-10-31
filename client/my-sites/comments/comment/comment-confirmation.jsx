/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteComment } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export class CommentConfirmation extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		undo: PropTypes.func,
	};

	render() {
		const { commentIsSpam, commentIsTrash, undo, translate } = this.props;

		return (
			<div className="comment__confirmation">
				{ ( commentIsSpam || commentIsTrash ) && (
					<div className="comment__confirmation-alert">
						{ commentIsSpam && (
							<div>
								{ translate( 'Marked as Spam' ) }
								<Gridicon icon="spam" size={ 18 } />
							</div>
						) }
						{ commentIsTrash && (
							<div>
								{ translate( 'Moved to Trash' ) }
								<Gridicon icon="trash" size={ 18 } />
							</div>
						) }
						<a onClick={ undo }>{ translate( 'Undo?' ) }</a>
					</div>
				) }
			</div>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );
	const commentStatus = get( comment, 'status' );

	return {
		commentIsSpam: 'spam' === commentStatus,
		commentIsTrash: 'trash' === commentStatus,
		postId: get( comment, 'post.ID' ),
		siteId,
	};
};

export default connect( mapStateToProps )( localize( CommentConfirmation ) );
