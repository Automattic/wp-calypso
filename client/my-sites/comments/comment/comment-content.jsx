/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';
import { stripHTML, decodeEntities } from 'lib/formatting';
import { getSiteComment } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export const CommentContent = ( { commentContent, isExpanded } ) => (
	<div className="comment__content">
		{ ! isExpanded && (
			<AutoDirection>
				<div className="comment__content-preview">
					<Emojify>{ decodeEntities( stripHTML( commentContent ) ) }</Emojify>
				</div>
			</AutoDirection>
		) }
		{ isExpanded && (
			<AutoDirection>
				<Emojify>
					<div
						className="comment__content-full"
						dangerouslySetInnerHTML={ { __html: commentContent } } //eslint-disable-line react/no-danger
					/>
				</Emojify>
			</AutoDirection>
		) }
	</div>
);

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );

	return {
		commentContent: get( comment, 'content' ),
	};
};

export default connect( mapStateToProps )( CommentContent );
