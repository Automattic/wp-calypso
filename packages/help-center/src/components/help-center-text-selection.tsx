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
	documentation: string | null;
}

const HelpCenterTextSelection: React.FC< TextSelectionProps > = ( { enabled = true } ) => {
	const [ selection, setSelection ] = useState< SelectionInfo | null >( null );
	const [ isVisible, setIsVisible ] = useState( false );
	const tooltipRef = useRef< HTMLDivElement | null >( null );
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
				setIsVisible( false );
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
				setIsVisible( false );
				return;
			}

			// Find the first data-documentation attribute up the DOM tree
			let documentation: string | null = null;
			let el: Element | null = parentElement;
			while ( el ) {
				if ( el.hasAttribute && el.hasAttribute( 'data-documentation' ) ) {
					documentation = el.getAttribute( 'data-documentation' );
					break;
				}
				el = el.parentElement;
			}

			// Only show tooltip for text selections with meaningful content
			if ( selectedText.length > 5 ) {
				const rect = range.getBoundingClientRect();
				setSelection( {
					text: selectedText,
					rect,
					range,
					documentation,
				} );
				// Small delay for smooth animation
				setTimeout( () => setIsVisible( true ), 50 );
			} else {
				setSelection( null );
				setIsVisible( false );
			}
		}, 100 );
	}, [ enabled ] );

	const handleDocumentClick = ( event: MouseEvent ) => {
		// Hide tooltip if clicking outside
		if ( tooltipRef.current && ! tooltipRef.current.contains( event.target as Node ) ) {
			const windowSelection = window.getSelection();
			if ( ! windowSelection || windowSelection.toString().trim().length === 0 ) {
				setSelection( null );
				setIsVisible( false );
			}
		}
	};

	const handleAskAI = async () => {
		if ( ! selection ) {
			return;
		}

		// Get current URL and selected text
		const currentUrl = window.location.href;
		const selectedText = selection.text;

		// Clear selection immediately
		setSelection( null );
		setIsVisible( false );
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

	const handleViewDocs = () => {
		if ( selection?.documentation ) {
			window.open( selection.documentation, '_blank', 'noopener,noreferrer' );
			setSelection( null );
			setIsVisible( false );
			window.getSelection()?.removeAllRanges();
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

	// Calculate tooltip dimensions (estimate based on content)
	const tooltipHeight = selection.documentation ? 100 : 50; // Approximate height based on buttons
	const tooltipWidth = 200;
	const margin = 12; // Margin from selection and viewport edges

	// Calculate available space in all directions
	const selectionCenter = selection.rect.left + selection.rect.width / 2;
	const selectionMiddle = selection.rect.top + selection.rect.height / 2;
	const spaceAbove = selection.rect.top;
	const spaceBelow = window.innerHeight - selection.rect.bottom;
	const spaceLeft = selection.rect.left;
	const spaceRight = window.innerWidth - selection.rect.right;

	// Determine best positioning strategy
	let tooltipLeft: number;
	let tooltipTop: number;
	let placement: 'above' | 'below' | 'left' | 'right' = 'below';

	// Check if we can fit above or below (preferred)
	if ( spaceAbove >= tooltipHeight + margin ) {
		placement = 'above';
	} else if ( spaceBelow >= tooltipHeight + margin ) {
		placement = 'below';
	} else if ( spaceRight >= tooltipWidth + margin ) {
		placement = 'right';
	} else if ( spaceLeft >= tooltipWidth + margin ) {
		placement = 'left';
	} else {
		// Fallback to the side with most space
		placement = spaceBelow > spaceAbove ? 'below' : 'above';
	}

	// Calculate position based on placement
	switch ( placement ) {
		case 'above':
			tooltipTop = selection.rect.top - tooltipHeight - margin;
			tooltipLeft = selectionCenter;
			break;
		case 'below':
			tooltipTop = selection.rect.bottom + margin;
			tooltipLeft = selectionCenter;
			break;
		case 'left':
			tooltipTop = selectionMiddle - tooltipHeight / 2;
			tooltipLeft = selection.rect.left - tooltipWidth - margin;
			break;
		case 'right':
			tooltipTop = selectionMiddle - tooltipHeight / 2;
			tooltipLeft = selection.rect.right + margin;
			break;
	}

	// Ensure tooltip stays within viewport bounds
	if ( placement === 'above' || placement === 'below' ) {
		// For vertical placement, adjust horizontal position
		const halfTooltipWidth = tooltipWidth / 2;
		if ( tooltipLeft - halfTooltipWidth < margin ) {
			tooltipLeft = halfTooltipWidth + margin;
		} else if ( tooltipLeft + halfTooltipWidth > window.innerWidth - margin ) {
			tooltipLeft = window.innerWidth - halfTooltipWidth - margin;
		}
		// Adjust vertical position if needed
		tooltipTop = Math.max(
			margin,
			Math.min( tooltipTop, window.innerHeight - tooltipHeight - margin )
		);
	} else {
		// For horizontal placement, adjust vertical position
		tooltipTop = Math.max(
			margin,
			Math.min( tooltipTop, window.innerHeight - tooltipHeight - margin )
		);
		// Adjust horizontal position if needed
		if ( placement === 'left' ) {
			tooltipLeft = Math.max( margin, tooltipLeft );
		} else {
			tooltipLeft = Math.min( window.innerWidth - tooltipWidth - margin, tooltipLeft );
		}
	}

	const tooltipStyle: React.CSSProperties = {
		position: 'fixed',
		left: tooltipLeft,
		top: tooltipTop,
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 0,
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
		border: '1px solid #e0e0e0',
		zIndex: 999999,
		opacity: isVisible ? 1 : 0,
		transform: ( () => {
			if ( isVisible ) {
				if ( placement === 'above' || placement === 'below' ) {
					return 'translateX(-50%) translateY(0) scale(1)';
				}
				return 'translateY(0) scale(1)';
			}
			if ( placement === 'above' || placement === 'below' ) {
				return 'translateX(-50%) translateY(-8px) scale(0.95)';
			}
			return 'translateY(-8px) scale(0.95)';
		} )(),
		transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
		minWidth: tooltipWidth,
		width: tooltipWidth,
		overflow: 'hidden',
	};

	const buttonBaseStyle: React.CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '12px 16px',
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
		fontSize: 14,
		fontWeight: 500,
		textDecoration: 'none',
		transition: 'all 0.15s ease',
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
		width: '100%',
		textAlign: 'left' as const,
	};

	const askAIButtonStyle: React.CSSProperties = {
		...buttonBaseStyle,
		color: '#3858e9',
		borderBottom: selection.documentation ? '1px solid #f0f0f0' : 'none',
	};

	const docsButtonStyle: React.CSSProperties = {
		...buttonBaseStyle,
		color: '#646970',
	};

	// Triangle pointer - only show for above/below placement and when aligned with selection
	const showTriangle =
		( placement === 'above' || placement === 'below' ) &&
		Math.abs( selectionCenter - tooltipLeft ) < tooltipWidth / 2;

	let triangleLeft = tooltipWidth / 2; // Default to center
	if ( showTriangle ) {
		const tooltipLeftEdge = tooltipLeft - tooltipWidth / 2;
		triangleLeft = Math.max( 16, Math.min( tooltipWidth - 16, selectionCenter - tooltipLeftEdge ) );
	}

	const triangleStyle: React.CSSProperties = {
		position: 'absolute',
		left: triangleLeft,
		transform: 'translateX(-50%)',
		width: 0,
		height: 0,
		borderLeft: '6px solid transparent',
		borderRight: '6px solid transparent',
	};

	const triangleTopStyle: React.CSSProperties = {
		...triangleStyle,
		bottom: -6,
		borderTop: '6px solid #fff',
	};

	const triangleBottomStyle: React.CSSProperties = {
		...triangleStyle,
		top: -6,
		borderBottom: '6px solid #fff',
	};

	return (
		<div
			ref={ tooltipRef }
			style={ tooltipStyle }
			role="tooltip"
			aria-label="Text selection actions"
		>
			{ placement === 'above' && showTriangle && <div style={ triangleTopStyle } /> }
			{ placement === 'below' && showTriangle && <div style={ triangleBottomStyle } /> }

			<button
				style={ askAIButtonStyle }
				onClick={ handleAskAI }
				onMouseEnter={ ( e ) => {
					e.currentTarget.style.backgroundColor = '#f6f7ff';
				} }
				onMouseLeave={ ( e ) => {
					e.currentTarget.style.backgroundColor = 'transparent';
				} }
				title="Get AI assistance with selected text"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12 2L15.09 8.26L22 9L17 14.74L18.18 21.02L12 17.77L5.82 21.02L7 14.74L2 9L8.91 8.26L12 2Z"
						fill="#3858e9"
					/>
				</svg>
				Ask in Help Center (AI)
			</button>

			{ selection.documentation && (
				<button
					style={ docsButtonStyle }
					onClick={ handleViewDocs }
					onMouseEnter={ ( e ) => {
						e.currentTarget.style.backgroundColor = '#f6f7f8';
					} }
					onMouseLeave={ ( e ) => {
						e.currentTarget.style.backgroundColor = 'transparent';
					} }
					title="View related documentation"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"
							fill="#646970"
						/>
					</svg>
					View Docs
				</button>
			) }
		</div>
	);
};

export default HelpCenterTextSelection;
