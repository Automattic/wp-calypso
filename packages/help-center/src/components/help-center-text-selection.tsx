/**
 * External Dependencies
 */
import { useFormulatedQuestions } from '@automattic/odie-client/src/data';
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
import { HelpCenterTooltip, type SelectionInfo } from './help-center-tooltip';
import type { HelpCenterDispatch } from '@automattic/data-stores';

type TextSelectionProps = {
	enabled?: boolean;
};

const HelpCenterTextSelection: React.FC< TextSelectionProps > = ( { enabled = true } ) => {
	const [ selection, setSelection ] = useState< SelectionInfo | null >( null );
	const [ isVisible, setIsVisible ] = useState( false );
	const [ showQuestions, setShowQuestions ] = useState( false );
	const [ questions, setQuestions ] = useState< string[] >( [] );
	const [ isLoadingQuestions, setIsLoadingQuestions ] = useState( false );
	const timeoutRef = useRef< number | null >( null );

	const dispatch = useDispatch( HELP_CENTER_STORE ) as HelpCenterDispatch[ 'dispatch' ];
	const formulatedQuestions = useFormulatedQuestions();
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
				setShowQuestions( false );
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
				setShowQuestions( false );
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
				setShowQuestions( false );
				setQuestions( [] );
				// Small delay for smooth animation
				setTimeout( () => setIsVisible( true ), 50 );
			} else {
				setSelection( null );
				setIsVisible( false );
				setShowQuestions( false );
			}
		}, 100 );
	}, [ enabled ] );

	const handleQuestionSelection = async ( question: string ) => {
		if ( ! selection ) {
			return;
		}

		// Clear selection immediately
		setSelection( null );
		setIsVisible( false );
		setShowQuestions( false );
		window.getSelection()?.removeAllRanges();

		// Clear chat first
		await resetSupportInteraction();
		clearHelpCenterZendeskConversationStarted();

		// Create URL with the question as parameter
		const encodedQuestion = encodeURIComponent( question );
		const currentUrl = new URL( window.location.href );
		currentUrl.searchParams.set( 'question', encodedQuestion );

		// NOW open Help Center and navigate to Odie with the question parameter
		dispatch.setNavigateToOdie( currentUrl.searchParams.toString() );

		try {
			// Create the user message
			const userMessage = {
				content: question,
				role: 'user' as MessageRole,
				type: 'message' as MessageType,
				internal_message_id: Date.now().toString(),
			};

			// Send the message through useSendChatMessage
			await sendChatMessage( userMessage );
		} catch ( error ) {}
	};

	const handleAskAI = async () => {
		if ( ! selection || isLoadingQuestions ) {
			return;
		}

		if ( showQuestions && questions.length > 0 ) {
			// If questions are already loaded, just toggle the dropdown
			setShowQuestions( false );
			return;
		}

		// Load questions from API
		setIsLoadingQuestions( true );

		try {
			const currentUrl = window.location.href;
			const selectedText = selection.text;

			const response = await formulatedQuestions.mutateAsync( {
				selectedText,
				url: currentUrl,
			} );

			// Check if the response has the expected structure
			if ( response ) {
				const validQuestions = response.filter( ( q ) => q && q.trim() );

				if ( validQuestions.length > 0 ) {
					setQuestions( validQuestions );
					setShowQuestions( true );
				} else {
					// Don't navigate here - just show a fallback question
					setQuestions( [ `Help me with: "${ selection.text }"` ] );
					setShowQuestions( true );
				}
			} else {
				// Don't navigate here - just show a fallback question
				setQuestions( [ `Help me with: "${ selection.text }"` ] );
				setShowQuestions( true );
			}
		} catch ( error ) {
			// Don't navigate here - just show a fallback question
			setQuestions( [ `Help me with: "${ selection.text }"` ] );
			setShowQuestions( true );
		} finally {
			setIsLoadingQuestions( false );
		}
	};

	const handleViewDocs = () => {
		if ( selection?.documentation ) {
			window.open( selection.documentation, '_blank', 'noopener,noreferrer' );
			setSelection( null );
			setIsVisible( false );
			setShowQuestions( false );
			window.getSelection()?.removeAllRanges();
		}
	};

	const handleClose = () => {
		setSelection( null );
		setIsVisible( false );
		setShowQuestions( false );
	};

	useEffect( () => {
		if ( ! enabled ) {
			return;
		}

		document.addEventListener( 'mouseup', handleMouseUp );

		return () => {
			document.removeEventListener( 'mouseup', handleMouseUp );
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current );
			}
		};
	}, [ enabled, handleMouseUp ] );

	if ( ! selection ) {
		return null;
	}

	return (
		<HelpCenterTooltip
			selection={ selection }
			isVisible={ isVisible }
			showQuestions={ showQuestions }
			questions={ questions }
			isLoadingQuestions={ isLoadingQuestions }
			onAskAI={ handleAskAI }
			onQuestionSelect={ handleQuestionSelection }
			onViewDocs={ handleViewDocs }
			onClose={ handleClose }
		/>
	);
};

export default HelpCenterTextSelection;
