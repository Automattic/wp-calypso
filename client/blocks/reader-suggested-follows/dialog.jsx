import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import SuggestedFollowItem from 'calypso/blocks/reader-suggested-follows';
import { useRelatedSites } from 'calypso/data/reader/use-related-sites';
import { READER_SUGGESTED_FOLLOWS_DIALOG } from 'calypso/reader/follow-sources';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

import './style.scss';

const ReaderSuggestedFollowsDialog = ( { onClose, siteId, postId, isVisible } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { data, isLoading } = useRelatedSites( siteId, postId );

	useEffect( () => {
		if ( isVisible ) {
			dispatch( recordReaderTracksEvent( 'calypso_reader_suggested_follows_dialog_viewed' ) );
		}
	}, [ isVisible, dispatch ] );

	// If we are no longer loading and no data available, don't show the dialog
	if ( ! isLoading && data === undefined ) {
		return null;
	}

	return (
		<Dialog
			additionalClassNames="reader-recommended-follows-dialog"
			isBackdropVisible
			isVisible={ isVisible }
			onClose={ onClose }
			showCloseIcon
			label={ translate( 'Suggested sites' ) }
			shouldCloseOnEsc
		>
			<div className="reader-recommended-follows-dialog__content">
				<div className="reader-recommended-follows-dialog__header">
					<h2 className="reader-recommended-follows-dialog__title">
						{ translate( 'Suggested sites' ) }
					</h2>
					<p className="reader-recommended-follows-dialog__description">
						{ translate( "While you're at it, you might check out these sites." ) }
					</p>
				</div>
				<div className="reader-recommended-follows-dialog__body">
					<div className="reader-recommended-follows-dialog__follow-list">
						<ul className="reader-recommended-follows-dialog__follow-list">
							{ isLoading && (
								<li className="reader-recommended-follows-dialog__follow-item is-placeholder"></li>
							) }
							{ ! isLoading &&
								data &&
								data.map( ( relatedSite ) => (
									<li
										key={ relatedSite.global_ID }
										className="reader-recommended-follows-dialog__follow-item"
									>
										<SuggestedFollowItem
											site={ relatedSite }
											followSource={ READER_SUGGESTED_FOLLOWS_DIALOG }
										/>
									</li>
								) ) }
						</ul>
					</div>
				</div>
			</div>
		</Dialog>
	);
};

export default ReaderSuggestedFollowsDialog;
