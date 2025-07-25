import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { SuggestedFollowItem } from 'calypso/blocks/reader-suggested-follows';
import { READER_SUGGESTED_FOLLOWS_DIALOG } from 'calypso/reader/follow-sources';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { useRecommendOrRelatedSitesQuery } from './hooks/use-recommend-or-related-sites-query';
import { RecommendedFeed } from './recommended-feed';
import './style.scss';

const ReaderSuggestedFollowsDialog = ( { onClose, siteId, postId, isVisible, author = {} } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const userName = author?.name;

	const { data, isLoading, resourceType } = useRecommendOrRelatedSitesQuery(
		{
			author,
			siteId,
			postId,
		},
		{
			enabled: isVisible,
		}
	);

	useEffect( () => {
		if ( isVisible && resourceType ) {
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_suggested_follows_dialog_viewed', {
					resource_type: resourceType,
				} )
			);
		}
	}, [ isVisible, dispatch, resourceType ] );

	// If we are no longer loading and no data available, don't show the dialog
	if ( ! isLoading && resourceType === null ) {
		return null;
	}

	const title =
		resourceType === 'recommended'
			? translate( 'Recommended sites' )
			: translate( 'Suggested sites' );

	const description =
		resourceType === 'recommended'
			? translate( 'While you’re at it, check out these sites %(authorName)s recommends.', {
					args: { authorName: userName },
			  } )
			: translate( 'While you’re at it, you might check out these sites.' );

	return (
		<Dialog
			additionalClassNames="reader-recommended-follows-dialog"
			isBackdropVisible
			isVisible={ isVisible }
			onClose={ onClose }
			showCloseIcon={ ! isLoading }
			label={ translate( 'Suggested sites' ) }
			shouldCloseOnEsc
		>
			<div className="reader-recommended-follows-dialog__content">
				{ isLoading && (
					<div
						className="reader-recommended-follows-dialog__loading-placeholder"
						role="alert"
						aria-busy="true"
						aria-label={ translate( 'Loading suggested sites' ) }
					>
						<span className="is-placeholder" />
						<span className="is-placeholder" />
						<span className="is-placeholder" />
						<span className="is-placeholder" />
						<span className="is-placeholder" />
						<span className="is-placeholder" />
					</div>
				) }
				{ ! isLoading && (
					<>
						<div className="reader-recommended-follows-dialog__header">
							<h2 className="reader-recommended-follows-dialog__title">{ ! isLoading && title }</h2>
							<p className="reader-recommended-follows-dialog__description">{ description }</p>
						</div>

						<div className="reader-recommended-follows-dialog__body">
							<div className="reader-recommended-follows-dialog__follow-list">
								<ul className="reader-recommended-follows-dialog__follow-list">
									{ resourceType === 'related' &&
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
									{ resourceType === 'recommended' &&
										data.map( ( recommendedFeed ) => (
											<li
												key={ recommendedFeed.feedId }
												className="reader-recommended-follows-dialog__follow-item"
											>
												<RecommendedFeed feed={ recommendedFeed } onClose={ onClose } />
											</li>
										) ) }
								</ul>
							</div>
						</div>
					</>
				) }
			</div>
		</Dialog>
	);
};

export default ReaderSuggestedFollowsDialog;
