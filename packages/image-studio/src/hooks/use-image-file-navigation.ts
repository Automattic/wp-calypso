import { select, useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect } from '@wordpress/element';
import { type ImageStudioActions, store as imageStudioStore } from '../store';
import { getMediaLibraryImages } from '../utils/get-media-library-images';
import { trackImageStudioFileNavigated } from '../utils/tracking';

interface UseImageFileNavigationProps {
	isOpen: boolean;
	originalAttachmentId: number | null;
	attachmentId: number | null;
	hasUnsavedChanges: boolean;
	isMediaLibraryContext: boolean;
}

interface UseImageFileNavigationReturn {
	handleNavigatePrevious: () => void;
	handleNavigateNext: () => Promise< void >;
	hasPreviousImage: boolean;
	hasNextImage: boolean;
}

/**
 * Custom hook to manage image file navigation in the media library.
 * Handles fetching navigable images, pagination, keyboard shortcuts, and navigation actions.
 * @param root0
 * @param root0.isOpen
 * @param root0.originalAttachmentId
 * @param root0.attachmentId
 * @param root0.hasUnsavedChanges
 * @param root0.isMediaLibraryContext
 */
export function useImageFileNavigation( {
	isOpen,
	originalAttachmentId,
	attachmentId,
	hasUnsavedChanges,
	isMediaLibraryContext,
}: UseImageFileNavigationProps ): UseImageFileNavigationReturn {
	const { setNavigableAttachmentIds, navigateToAttachment, setNavigationPagination } = useDispatch(
		imageStudioStore
	) as ImageStudioActions;

	// Select navigation state from store
	const {
		hasPreviousImage,
		hasNextImage,
		previousAttachmentId,
		nextAttachmentId,
		navigableAttachmentIds,
		currentNavigationIndex,
		navigationCurrentPage,
		navigationHasMorePages,
	} = useSelect(
		( selectStore ) => ( {
			hasPreviousImage: selectStore( imageStudioStore ).getHasPreviousImage(),
			hasNextImage: selectStore( imageStudioStore ).getHasNextImage(),
			previousAttachmentId: selectStore( imageStudioStore ).getPreviousAttachmentId(),
			nextAttachmentId: selectStore( imageStudioStore ).getNextAttachmentId(),
			navigableAttachmentIds: selectStore( imageStudioStore ).getNavigableAttachmentIds(),
			currentNavigationIndex: selectStore( imageStudioStore ).getCurrentNavigationIndex(),
			navigationCurrentPage: selectStore( imageStudioStore ).getNavigationCurrentPage(),
			navigationHasMorePages: selectStore( imageStudioStore ).getNavigationHasMorePages(),
		} ),
		[]
	);

	// Perform the actual navigation
	const performFileNavigation = useCallback(
		( targetAttachmentId: number, direction: 'previous' | 'next' ) => {
			// Track navigation
			trackImageStudioFileNavigated( {
				attachmentId: targetAttachmentId,
				direction,
			} );
			navigateToAttachment( targetAttachmentId );
		},
		[ navigateToAttachment ]
	);

	// Fetch media library images when opening from media library
	// TODO: Consider creating a custom REST API endpoint to fetch all navigable images in a single request
	// instead of making up to 5 sequential paginated requests. This would improve performance and simplify
	// the client-side logic by moving the recursion and accumulation logic to an optimized server-side query.
	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}

		// Only fetch navigable images when opened from media library with an attachment ID
		if ( ! originalAttachmentId ) {
			return;
		}

		const isMediaLibraryPage = window.location.pathname.includes( 'upload.php' );

		if ( ! isMediaLibraryPage ) {
			return;
		}

		const fetchMediaLibraryImages = async ( page: number = 1, accumulatedIds: number[] = [] ) => {
			const result = await getMediaLibraryImages( 100, page );
			if ( result.ids.length > 0 ) {
				// Accumulate IDs across recursive calls
				const allIds = page === 1 ? result.ids : [ ...accumulatedIds, ...result.ids ];

				// Update store with accumulated IDs
				setNavigableAttachmentIds( allIds, originalAttachmentId );
				setNavigationPagination( page, result.hasMore );

				// Check if we found the current attachment
				const foundCurrent = originalAttachmentId && allIds.includes( originalAttachmentId );

				// If we haven't found it yet and there are more pages, load next page
				// Limit to 5 pages (500 images) to prevent excessive loading
				if ( ! foundCurrent && result.hasMore && page < 5 ) {
					await fetchMediaLibraryImages( page + 1, allIds );
				}
			}
		};

		fetchMediaLibraryImages( 1, [] );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		isOpen,
		originalAttachmentId,
		// Note: setNavigableAttachmentIds and setNavigationPagination are stable dispatch functions
		// Do NOT include navigation state (navigationCurrentPage, navigableAttachmentIds, etc.)
		// as dependencies - they change during navigation and would cause this effect to re-run
	] );

	// Handle navigation to previous image
	const handleNavigatePrevious = useCallback( () => {
		if ( ! previousAttachmentId || hasUnsavedChanges ) {
			return;
		}

		// No pagination needed when navigating to previous (more recent) images
		// since page 1 already contains the most recent images
		performFileNavigation( previousAttachmentId, 'previous' );
	}, [ previousAttachmentId, hasUnsavedChanges, performFileNavigation ] );

	// Handle navigation to next image
	const handleNavigateNext = useCallback( async () => {
		if ( ! nextAttachmentId || hasUnsavedChanges ) {
			return;
		}

		// Check if we're within 10 items of the end and should fetch more
		const shouldLoadMore =
			navigationHasMorePages && currentNavigationIndex >= navigableAttachmentIds.length - 10;

		if ( shouldLoadMore ) {
			const result = await getMediaLibraryImages( 100, navigationCurrentPage + 1 );
			if ( result.ids.length > 0 ) {
				// Get current IDs from store to avoid stale closure
				const currentIds = select( imageStudioStore ).getNavigableAttachmentIds();
				// Append to existing list
				setNavigableAttachmentIds( [ ...currentIds, ...result.ids ], attachmentId );
				setNavigationPagination( navigationCurrentPage + 1, result.hasMore );
			}
		}

		// Navigate immediately
		performFileNavigation( nextAttachmentId, 'next' );
	}, [
		nextAttachmentId,
		hasUnsavedChanges,
		navigationHasMorePages,
		currentNavigationIndex,
		navigableAttachmentIds,
		navigationCurrentPage,
		attachmentId,
		setNavigableAttachmentIds,
		setNavigationPagination,
		performFileNavigation,
	] );

	// Keyboard shortcuts for navigation - Cmd/Ctrl + Left/Right arrows
	// Only available in media library context
	// Placed at parent component level to ensure it's always active, even during transitions
	useEffect( () => {
		if ( ! isOpen || ! isMediaLibraryContext ) {
			return;
		}

		const handleKeyDown = ( event: KeyboardEvent ) => {
			// Check for Cmd (Mac) or Ctrl (Windows/Linux) + Arrow keys
			const isModKey = event.metaKey || event.ctrlKey;
			const isLeftArrow = event.key === 'ArrowLeft';
			const isRightArrow = event.key === 'ArrowRight';

			if ( ! isModKey || ( ! isLeftArrow && ! isRightArrow ) ) {
				return;
			}

			// ALWAYS prevent default to block browser navigation
			event.preventDefault();
			event.stopPropagation();

			// Handle left arrow
			if ( isLeftArrow && hasPreviousImage ) {
				handleNavigatePrevious();
			}

			// Handle right arrow
			if ( isRightArrow && hasNextImage ) {
				handleNavigateNext();
			}
		};

		// Add listener with capture phase to intercept before any other handlers
		window.addEventListener( 'keydown', handleKeyDown, true );

		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, true );
		};
	}, [
		isOpen,
		isMediaLibraryContext,
		hasPreviousImage,
		hasNextImage,
		handleNavigatePrevious,
		handleNavigateNext,
	] );

	return {
		handleNavigatePrevious,
		handleNavigateNext,
		hasPreviousImage,
		hasNextImage,
	};
}
