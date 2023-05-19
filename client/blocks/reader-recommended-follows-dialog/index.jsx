import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SuggestedFollowItem from 'calypso/blocks/reader-suggested-follows';
import { READER_SUGGESTED_FOLLOWS_DIALOG } from 'calypso/reader/follow-sources';

import './style.scss';

// Create component to convert posts to list of sites
const SuggestedFollowItems = ( { relatedPosts } ) => {
	if ( ! relatedPosts ) {
		return null;
	}
	const items = relatedPosts.map( ( post_id ) => {
		return (
			post_id && (
				<li key={ post_id } className="reader-recommended-follows-dialog__follow-item">
					<SuggestedFollowItem post={ post_id } followSource={ READER_SUGGESTED_FOLLOWS_DIALOG } />
				</li>
			)
		);
	} );

	return <ul className="reader-recommended-follows-dialog__follow-list">{ items }</ul>;
};

const ReaderRecommendedFollowsDialog = ( { onClose, relatedPosts } ) => {
	const translate = useTranslate();
	if ( ! relatedPosts ) {
		return null;
	}
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
						{ relatedPosts && relatedPosts.length > 0 && (
							<SuggestedFollowItems relatedPosts={ relatedPosts } />
						) }
					</div>
				</div>
			</div>
		</Dialog>
	);
};

export default ReaderRecommendedFollowsDialog;
