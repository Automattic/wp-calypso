/**
 * External Dependencies
 */
import { useFormulateQuestion } from '@automattic/odie-client/src/data';
import { useSendChatMessage } from '@automattic/odie-client/src/hooks';
import { MessageRole, MessageType } from '@automattic/odie-client/src/types';
import { clearHelpCenterZendeskConversationStarted } from '@automattic/odie-client/src/utils/storage-utils';
import { useDispatch } from '@wordpress/data';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import { useResetSupportInteraction } from '../hooks/use-reset-support-interaction';
import { HELP_CENTER_STORE } from '../stores';
import type { HelpCenterDispatch } from '@automattic/data-stores';

interface TextSelectionProps {
	enabled?: boolean;
}

interface SelectionInfo {
	text: string;
	rect: DOMRect;
	range: Range;
}

const HelpCenterTextSelection: React.FC< TextSelectionProps > = ( { enabled = true } ) => {
	const [ selection, setSelection ] = useState< SelectionInfo | null >( null );
	const iconRef = useRef< HTMLDivElement | null >( null );
	const timeoutRef = useRef< number | null >( null );
	const dispatch = useDispatch( HELP_CENTER_STORE ) as HelpCenterDispatch[ 'dispatch' ];
	const formulateQuestion = useFormulateQuestion();
	const sendChatMessage = useSendChatMessage();
	const resetSupportInteraction = useResetSupportInteraction();

	const handleMouseUp = useCallback( () => {
		if ( ! enabled ) {
			return;
		}

		// Clear any existing timeout
		if ( timeoutRef.current ) {
			clearTimeout( timeoutRef.current );
		}

		// Small delay to ensure selection is complete
		timeoutRef.current = setTimeout( () => {
			const windowSelection = window.getSelection();
			if ( ! windowSelection || windowSelection.rangeCount === 0 ) {
				setSelection( null );
				return;
			}

			const range = windowSelection.getRangeAt( 0 );
			const selectedText = windowSelection.toString().trim();

			// Check if selection is within help-center div
			const commonAncestor = range.commonAncestorContainer;
			const parentElement =
				commonAncestor.nodeType === Node.TEXT_NODE
					? commonAncestor.parentElement
					: ( commonAncestor as Element );

			if ( parentElement && parentElement.closest( '.help-center' ) ) {
				setSelection( null );
				return;
			}

			// Only show icon for text selections with meaningful content
			if ( selectedText.length > 5 ) {
				const rect = range.getBoundingClientRect();
				setSelection( {
					text: selectedText,
					rect,
					range,
				} );
			} else {
				setSelection( null );
			}
		}, 100 );
	}, [ enabled ] );

	const handleDocumentClick = ( event: MouseEvent ) => {
		// Hide icon if clicking outside the icon or selection
		if ( iconRef.current && ! iconRef.current.contains( event.target as Node ) ) {
			const windowSelection = window.getSelection();
			if ( ! windowSelection || windowSelection.toString().trim().length === 0 ) {
				setSelection( null );
			}
		}
	};

	const handleIconClick = async () => {
		if ( ! selection ) {
			return;
		}

		// Get current URL and selected text
		const currentUrl = window.location.href;
		const selectedText = selection.text;

		// Clear selection immediately
		setSelection( null );
		window.getSelection()?.removeAllRanges();

		// Clear chat first (same as in help-center-header.tsx)
		await resetSupportInteraction();
		clearHelpCenterZendeskConversationStarted();

		// Open Help Center and navigate to Odie first
		dispatch.setNavigateToOdie();

		try {
			// Get the formulated question from the API
			const result = await formulateQuestion.mutateAsync( {
				selectedText,
				url: currentUrl,
			} );

			// Extract the formulated question from the response
			const formulatedQuestion = result.formatted_question;

			// Create the actual user message with the formulated question
			const userMessage = {
				content: formulatedQuestion,
				role: 'user' as MessageRole,
				type: 'message' as MessageType,
				internal_message_id: Date.now().toString(),
			};

			// Send the message through useSendChatMessage (this will handle user message + bot response)
			await sendChatMessage( userMessage );
		} catch ( error ) {
			// Fallback: Send original text if formulate_question fails
			const fallbackMessage = {
				content: `Help me with: "${ selectedText }"`,
				role: 'user' as MessageRole,
				type: 'message' as MessageType,
				internal_message_id: Date.now().toString(),
			};

			// Send the fallback message through useSendChatMessage
			await sendChatMessage( fallbackMessage );
		}
	};

	useEffect( () => {
		if ( ! enabled ) {
			return;
		}

		document.addEventListener( 'mouseup', handleMouseUp );
		document.addEventListener( 'click', handleDocumentClick );

		return () => {
			document.removeEventListener( 'mouseup', handleMouseUp );
			document.removeEventListener( 'click', handleDocumentClick );
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current );
			}
		};
	}, [ enabled, handleMouseUp ] );

	if ( ! selection ) {
		return null;
	}

	const iconStyle: React.CSSProperties = {
		position: 'fixed',
		left: selection.rect.right + 8,
		top: selection.rect.top + ( selection.rect.height - 24 ) / 2,
		width: 24,
		height: 24,
		backgroundColor: '#0073aa',
		borderRadius: '50%',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
		zIndex: 999999,
		transition: 'all 0.2s ease',
	};

	return (
		<div
			ref={ iconRef }
			style={ iconStyle }
			onClick={ handleIconClick }
			onMouseEnter={ ( e ) => {
				e.currentTarget.style.transform = 'scale(1.1)';
				e.currentTarget.style.backgroundColor = '#005a87';
			} }
			onMouseLeave={ ( e ) => {
				e.currentTarget.style.transform = 'scale(1)';
				e.currentTarget.style.backgroundColor = '#0073aa';
			} }
			title="Get help with selected text"
			role="button"
			tabIndex={ 0 }
			onKeyDown={ ( e ) => {
				if ( e.key === 'Enter' || e.key === ' ' ) {
					e.preventDefault();
					handleIconClick();
				}
			} }
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
					fill="white"
				/>
			</svg>
		</div>
	);
};

export default HelpCenterTextSelection;
