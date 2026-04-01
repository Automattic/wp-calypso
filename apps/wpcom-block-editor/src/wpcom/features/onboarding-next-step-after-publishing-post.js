import apiFetch from '@wordpress/api-fetch';
import { dispatch, select, subscribe, useSelect } from '@wordpress/data';
import { useState, useEffect, useRef } from 'react';
import { CelebrateFirstPostModal } from './celebrate-first-post-modal';
import useSiteIntent from './use-site-intent';

export function OnboardingNextStepAfterPublishingPost() {
	const [ showCelebration, setShowCelebration ] = useState( false );
	const firstPostAlreadyPublishedRef = useRef( null );
	const launchpadFetchPromiseRef = useRef( null );
	const unmountedRef = useRef( false );

	const { siteIntent } = useSiteIntent();
	const currentPostType = useSelect(
		( localSelect ) => localSelect( 'core/editor' ).getCurrentPostType(),
		[]
	);

	const isNewsletterPost = siteIntent === 'newsletter' && currentPostType === 'post';

	// Fetch launchpad status on mount for newsletter posts.
	useEffect( () => {
		if ( ! isNewsletterPost ) {
			return;
		}

		const promise = apiFetch( { path: '/wpcom/v2/launchpad' } )
			.then( ( response ) => {
				firstPostAlreadyPublishedRef.current =
					response?.checklist_statuses?.first_post_published ?? false;
			} )
			.catch( () => {
				// On failure, default to false so a first-publish can still celebrate.
				firstPostAlreadyPublishedRef.current = false;
			} );

		launchpadFetchPromiseRef.current = promise;
	}, [ isNewsletterPost ] );

	// Watch for publish transitions using a persistent subscriber.
	useEffect( () => {
		if ( ! isNewsletterPost ) {
			return;
		}

		unmountedRef.current = false;
		let prevIsSaving = select( 'core/editor' ).isSavingPost();
		let wasPublishedBeforeSave = select( 'core/editor' ).isCurrentPostPublished();
		let didCelebrate = false;

		const unsubscribe = subscribe( () => {
			if ( didCelebrate ) {
				return;
			}

			const isSaving = select( 'core/editor' ).isSavingPost();

			if ( ! prevIsSaving && isSaving ) {
				// Snapshot the pre-save published state when a save cycle starts.
				wasPublishedBeforeSave = select( 'core/editor' ).isCurrentPostPublished();
			}

			if ( prevIsSaving && ! isSaving ) {
				const isNowPublished = select( 'core/editor' ).isCurrentPostPublished();

				if ( isNowPublished && ! wasPublishedBeforeSave ) {
					const fetchPromise = launchpadFetchPromiseRef.current || Promise.resolve();

					fetchPromise.then( () => {
						if ( unmountedRef.current || didCelebrate ) {
							return;
						}

						if ( firstPostAlreadyPublishedRef.current === false ) {
							didCelebrate = true;

							dispatch( 'core/edit-post' ).closePublishSidebar();

							// Best-effort removal of the save notice so it doesn't overlap the modal.
							const notices = select( 'core/notices' ).getNotices();
							if ( notices.some( ( notice ) => notice.id === 'editor-save' ) ) {
								dispatch( 'core/notices' ).removeNotice( 'editor-save' );
							}

							setShowCelebration( true );
						}
					} );
				}
			}

			prevIsSaving = isSaving;
		} );

		return () => {
			unmountedRef.current = true;
			unsubscribe();
		};
	}, [ isNewsletterPost ] );

	if ( ! showCelebration ) {
		return null;
	}

	return <CelebrateFirstPostModal onClose={ () => setShowCelebration( false ) } />;
}
