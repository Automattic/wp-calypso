import { Dialog } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { SuggestedFollowItem } from 'calypso/blocks/reader-suggested-follows';
import { READER_SUGGESTED_FOLLOWS_DIALOG } from 'calypso/reader/follow-sources';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { useRecommendOrRelatedSitesQuery } from './hooks/use-recommend-or-related-sites-query';
import { RecommendedFeed } from './recommended-feed';

import './style.scss';

const useHasScrolledContent = () => {
	const [ hasScrolledContent, setHasScrolledContent ] = useState( false );

	const onContentContainerScroll = useCallback(
		( e ) => {
			const scrollY = e?.currentTarget?.scrollTop ?? -1;

			if ( ! hasScrolledContent && scrollY > 0 ) {
				setHasScrolledContent( true );
			} else if ( hasScrolledContent && scrollY <= 0 ) {
				setHasScrolledContent( false );
			}
		},
		[ hasScrolledContent ]
	);

	return { hasScrolledContent, onContentContainerScroll };
};

const ReaderSuggestedFollowsDialog = ( {
	onClose,
	siteId,
	prefetch = false,
	postId,
	isVisible,
	author = {},
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const userName = author?.name;
	const { hasScrolledContent, onContentContainerScroll } = useHasScrolledContent();
	const query = useMemo(
		() => ( {
			author,
			siteId,
			postId,
		} ),
		[ author, siteId, postId ]
	);

	const { data, isFetched, resourceType, isLoading } = useRecommendOrRelatedSitesQuery( query, {
		enabled: prefetch || isVisible,
	} );

	const shouldCloseModal = isFetched && isVisible && data?.length === 0;

	useEffect( () => {
		if ( isVisible && resourceType ) {
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_suggested_follows_dialog_viewed', {
					resource_type: resourceType,
				} )
			);
		}
	}, [ isVisible, dispatch, resourceType ] );

	const trackNoResults = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_suggested_follows_dialog_closed_no_results', {
				author_name: userName,
				site_id: siteId,
				post_id: postId,
			} )
		);
	}, [ dispatch, userName, siteId, postId ] );

	useEffect( () => {
		if ( shouldCloseModal ) {
			trackNoResults();
			onClose();
		}
	}, [ shouldCloseModal, onClose, trackNoResults ] );

	const title =
		resourceType === 'recommended'
			? translate( 'Recommended blogs' )
			: translate( 'Suggested blogs' );

	const description =
		resourceType === 'recommended'
			? translate(
					'While you’re at it, check out these blogs that {{strong}}%(authorName)s{{/strong}} recommends.',
					{
						args: { authorName: userName },
						components: { strong: <strong /> },
					}
			  )
			: translate( 'While you’re at it, you might check out these blogs.' );

	return (
		<Dialog
			additionalClassNames={ clsx( 'reader-recommended-follows-dialog', {
				'is-loading': isLoading,
			} ) }
			isBackdropVisible
			isVisible={ isVisible }
			onClose={ onClose }
			showCloseIcon={ ! isLoading }
			label={ title }
			shouldCloseOnEsc
		>
			<div
				className={ clsx( 'reader-recommended-follows-dialog__content', {
					'has-scrolled-content': hasScrolledContent,
				} ) }
			>
				{ isLoading && (
					<div
						className="reader-recommended-follows-dialog__loading-placeholder"
						role="alert"
						aria-busy="true"
						aria-label={ translate( 'Loading suggested blogs' ) }
					>
						<span className="placeholder-title is-placeholder" />
						<span className="placeholder-description is-placeholder" />
						<span className="placeholder-item is-placeholder" />
						<span className="placeholder-item is-placeholder" />
						<span className="placeholder-item is-placeholder" />
						<span className="placeholder-item is-placeholder" />
						<span className="placeholder-item is-placeholder" />
					</div>
				) }
				{ ! isLoading && (
					<>
						<div className="reader-recommended-follows-dialog__header">
							<h2 className="reader-recommended-follows-dialog__title">{ ! isLoading && title }</h2>
							<p className="reader-recommended-follows-dialog__description">{ description }</p>
						</div>

						<div
							className="reader-recommended-follows-dialog__body"
							onScroll={ onContentContainerScroll }
						>
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
					</>
				) }
			</div>
		</Dialog>
	);
};

export default ReaderSuggestedFollowsDialog;
