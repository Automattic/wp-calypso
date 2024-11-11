import { useState, useEffect, useRef } from 'react';
import { scrollToComments } from 'calypso/blocks/reader-full-post/scroll-to-comments';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import { READER_SHARE_MENU_CLOSE } from 'calypso/blocks/reader-share';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import { useSelector } from 'calypso/state';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';

interface EngagementBarProps {
	className?: string;
	feedId?: string | number;
	postId?: string | number;
}

const EngagementBar = ( { className = '', feedId, postId }: EngagementBarProps ) => {
	const barRef = useRef< HTMLDivElement >( null );
	const post = useSelector( ( state ) =>
		feedId && postId ? getPostByKey( state, { feedId, postId } ) : null
	);

	const [ isActionsVisible, setIsActionsVisible ] = useState( false );
	const [ actionsElement, setActionsElement ] = useState< Element | null >( null );

	const handleCommentClick = () => {
		recordAction( 'click_comments' );
		recordGaEvent( 'Clicked Post Comment Button' );
		recordTrackForPost( 'calypso_reader_post_comments_button_clicked', post );
		scrollToComments( { focusTextArea: true } );
	};

	// Set the width of the "engagement bar" and "reader post actions" to the width of the parent because CSS `fill-available` is unreliable.
	useEffect( () => {
		if ( ! barRef.current ) {
			return;
		}

		const updateWidth = ( parentWidth: number ) => {
			if ( barRef.current ) {
				barRef.current.style.width = `${ parentWidth }px`;
				const actionsElement = barRef.current.querySelector( '.reader-post-actions' );
				if ( actionsElement ) {
					( actionsElement as HTMLElement ).style.width = `${ parentWidth }px`;
				}
			}
		};

		// Create ResizeObserver to watch the parent element
		const resizeObserver = new ResizeObserver( ( entries ) => {
			for ( const entry of entries ) {
				const parentWidth = entry.contentRect.width;
				updateWidth( parentWidth );
			}
		} );

		// Start observing the parent element
		if ( barRef.current.parentElement ) {
			resizeObserver.observe( barRef.current.parentElement );
		}

		// Cleanup: stop observing when component unmounts.
		return () => {
			resizeObserver.disconnect();
		};
	}, [] );

	// Find the `actionsElement` in the DOM.
	useEffect( () => {
		// Set up a MutationObserver to detect when the "Reader Post Actions" aka `actionsElement` appears in the DOM
		// This is needed because the FullPostView component loads asynchronously.
		const observer = new MutationObserver( () => {
			const element = document.querySelector( '.reader-full-post .reader-post-actions' );
			if ( element ) {
				setActionsElement( element );
				// Stop observing once we've found the element.
				observer.disconnect();
			}
		} );

		// Begin watching for the `actionsElement` element to appear in the DOM.
		observer.observe( document.body, {
			childList: true,
			subtree: true,
		} );

		// Cleanup: stop observing when component unmounts.
		return () => observer.disconnect();
	}, [] );

	// Look for the `actionsElement` in the viewport.
	useEffect( () => {
		// If the `actionsElement` does not exist, do nothing.
		if ( ! actionsElement ) {
			return;
		}

		// Create an IntersectionObserver to detect when the `actionsElement` enters or exits the viewport.
		const intersectionObserver = new IntersectionObserver(
			( [ entry ] ) => {
				// Update the visibility state based on whether the `actionsElement` is in the viewport.
				setIsActionsVisible( entry.isIntersecting );
			},
			{
				// Element is considered visible when 10% is in view.
				threshold: 0.1,
				// No margin around the root intersection area.
				rootMargin: '0px',
			}
		);

		// Begin watching for the `actionsElement` element to appear in the viewport.
		intersectionObserver.observe( actionsElement );

		// Cleanup: stop observing when component unmounts or `actionsElement` changes.
		return () => {
			intersectionObserver.disconnect();
		};
	}, [ actionsElement ] );

	// Close the share popovers anytime the engagement bar changes visibility.
	useEffect( () => {
		READER_SHARE_MENU_CLOSE.trigger();
	}, [ isActionsVisible ] );

	return (
		<div
			ref={ barRef }
			className={ `recent-feed__post-column-engagement-bar ${
				isActionsVisible ? 'engagement-bar-is-hidden' : ''
			} ${ className }` }
		>
			{ post && (
				<ReaderPostActions
					className="engagement-bar__actions"
					post={ post }
					onCommentClick={ handleCommentClick }
				/>
			) }
		</div>
	);
};

export default EngagementBar;
