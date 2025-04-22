import { __ } from '@wordpress/i18n';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { RefObject, useCallback, useEffect, useState, useRef } from 'react';
import { useOdieAssistantContext } from '../../context';
import './jump-to-recent.scss';

export const JumpToRecent = ( {
	containerReference,
}: {
	containerReference: RefObject< HTMLDivElement >;
} ) => {
	const { trackEvent, isMinimized, chat } = useOdieAssistantContext();
	const [ isVisible, setIsVisible ] = useState( false );
	const [ offsetStyle, setOffsetStyle ] = useState< React.CSSProperties >( {} );
	const isJumpingRef = useRef( false );
	const visibilityTimeoutRef = useRef< number | null >( null );
	const buttonRef = useRef< HTMLDivElement >( null );

	// Function to scroll to the most recent message
	const jumpToRecent = useCallback( () => {
		if ( containerReference.current && chat.messages.length > 0 ) {
			// Mark that we're jumping
			isJumpingRef.current = true;

			// Scroll to bottom
			containerReference.current.scrollTo( {
				top: containerReference.current.scrollHeight,
				behavior: 'smooth',
			} );

			trackEvent( 'chat_jump_to_recent_click' );

			// Reset after animation completes
			setTimeout( () => {
				isJumpingRef.current = false;
				setIsVisible( false );
			}, 1000 );
		}
	}, [ containerReference, trackEvent, chat.messages.length ] );

	// Calculate and update position based on other elements
	const updatePosition = useCallback( () => {
		const chatbox = document.querySelector( '.chatbox' );
		if ( ! chatbox ) {
			return;
		}

		// Get heights of dynamic elements
		const noticeEl = chatbox.querySelector( '.odie-notice__container' );
		const inputEl = chatbox.querySelector( '.odie-chat-message-input-container' );

		const noticeHeight = noticeEl ? noticeEl.clientHeight : 0;
		const inputHeight = inputEl ? inputEl.clientHeight : 0;

		// Calculate total offset - we'll position the button above these elements
		const totalOffset = noticeHeight + inputHeight;

		// Apply position
		setOffsetStyle( {
			bottom: `${ totalOffset }px`,
		} );
	}, [] );

	// Handle scrolling using Intersection Observer on the last message
	useEffect( () => {
		const container = containerReference.current;
		if ( ! container || isMinimized || chat.messages.length < 2 || ! chat.odieId ) {
			setIsVisible( false );
			return;
		}

		// Update position initially
		updatePosition();

		// Create intersection observer
		const observer = new IntersectionObserver(
			( entries ) => {
				// If we're in the middle of jumping, skip the check
				if ( isJumpingRef.current ) {
					return;
				}

				const entry = entries[ 0 ];
				// Show button when less than 10% of last message is visible
				const shouldBeVisible = entry.intersectionRatio < 0.1;

				if ( shouldBeVisible && ! isVisible ) {
					// Update position before showing
					updatePosition();

					// Show immediately
					setIsVisible( true );

					// Clear any pending hide
					if ( visibilityTimeoutRef.current ) {
						clearTimeout( visibilityTimeoutRef.current );
						visibilityTimeoutRef.current = null;
					}
				} else if ( ! shouldBeVisible && isVisible ) {
					// Hide after a slight delay
					if ( ! visibilityTimeoutRef.current ) {
						visibilityTimeoutRef.current = setTimeout( () => {
							setIsVisible( false );
							visibilityTimeoutRef.current = null;
						}, 300 ) as unknown as number;
					}
				}
			},
			{
				root: container,
				threshold: [ 0, 0.1 ],
			}
		);

		// Function to find and observe the last message
		const observeLastMessage = () => {
			// Simply get all children of the container
			const children = Array.from( container.children );

			if ( children.length > 0 ) {
				// Get the last child element that is visible
				for ( let i = children.length - 1; i >= 0; i-- ) {
					const lastElement = children[ i ] as HTMLElement;
					if ( lastElement.offsetParent !== null ) {
						// Start observing the last visible element
						observer.observe( lastElement );
						return lastElement;
					}
				}
			}
			return null;
		};

		// Find and observe the last message
		let lastMessageObserved = observeLastMessage();

		// Set up a mutation observer to detect when new messages are added
		const mutationObserver = new MutationObserver( () => {
			// If we already have a last message, disconnect from it
			if ( lastMessageObserved ) {
				observer.unobserve( lastMessageObserved );
			}
			// Find and observe the new last message
			lastMessageObserved = observeLastMessage();
		} );

		// Start observing changes to the container for any new messages
		mutationObserver.observe( container, {
			childList: true,
			subtree: true,
		} );

		// Listen for resize and element changes
		const resizeObserver = new ResizeObserver( () => {
			updatePosition();
		} );

		// Observe the input container and notice for size changes
		const chatbox = container.closest( '.chatbox' );
		if ( chatbox ) {
			const noticeEl = chatbox.querySelector( '.odie-notice__container' );
			const inputEl = chatbox.querySelector( '.odie-chat-message-input-container' );

			if ( noticeEl ) {
				resizeObserver.observe( noticeEl );
			}
			if ( inputEl ) {
				resizeObserver.observe( inputEl );
			}
		}

		// Clean up
		return () => {
			observer.disconnect();
			mutationObserver.disconnect();
			if ( visibilityTimeoutRef.current ) {
				clearTimeout( visibilityTimeoutRef.current );
			}
			resizeObserver.disconnect();
		};
	}, [
		containerReference,
		chat.messages.length,
		chat.status,
		chat.odieId, // Add odieId to dependencies to detect when chat is cleared
		isMinimized,
		isVisible,
		updatePosition,
	] );

	// Always render, but control visibility with CSS class
	return (
		<div
			ref={ buttonRef }
			className={ clsx( 'odie-gradient-to-white', {
				'is-visible': isVisible && chat.odieId, // Only show if chat is active and button should be visible
			} ) }
			style={ offsetStyle }
		>
			<button
				className="odie-jump-to-recent-message-button"
				onClick={ jumpToRecent }
				disabled={ ! isVisible || ! chat.odieId } // Disable if not visible or no active chat
			>
				{ __( 'Jump to recent', __i18n_text_domain__ ) }
				<Icon icon={ chevronDown } fill="white" />
			</button>
		</div>
	);
};
