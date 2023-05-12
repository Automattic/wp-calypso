import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import QueryReaderRelatedPosts from 'calypso/components/data/query-reader-related-posts';
import { relatedPostsForPost } from 'calypso/state/reader/related-posts/selectors';
import { SCOPE_OTHER } from 'calypso/state/reader/related-posts/utils';

import './style.scss';

function ReaderRecommendedFollowsDialog( { onClose, siteId, postId, posts } ) {
	const translate = useTranslate();
	//console.debug( 'ReaderRecommendedFollowsDialog', { onClose, siteId, postId, posts } );
	return (
		<Dialog
			additionalClassNames="reader-recommended-follows-dialog"
			isBackdropVisible={ true }
			isVisible={ true }
			onClose={ onClose }
			showCloseIcon={ true }
		>
			<div className="reader-recommended-follows-dialog__content">
				<div className="reader-recommended-follows-dialog__header">
					<h2 className="reader-recommended-follows-dialog__title">
						{ translate( 'Suggested follows' ) }
					</h2>
					<p className="reader-recommended-follows-dialog__description">
						{ translate( "While you're at it, you might as well check out these sites" ) }
					</p>
				</div>
				<div className="reader-recommended-follows-dialog__body">
					<div className="reader-recommended-follows-dialog__follow-list">
						<ul>
							{ ! posts && (
								<QueryReaderRelatedPosts
									siteId={ siteId }
									postId={ postId }
									scope={ SCOPE_OTHER }
								/>
							) }
						</ul>
					</div>
				</div>
			</div>
		</Dialog>
	);
}

export default connect( ( state, ownProps ) => {
	return {
		posts: relatedPostsForPost( state, ownProps.siteId, ownProps.postId, SCOPE_OTHER ),
		scope: SCOPE_OTHER,
	};
}, null )( ReaderRecommendedFollowsDialog );
