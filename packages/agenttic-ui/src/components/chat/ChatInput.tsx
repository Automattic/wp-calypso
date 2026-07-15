import React, { useCallback, useEffect, useId, useRef } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ArrowUpIcon } from '../icons/ArrowUpIcon';
import { StopIcon } from '../icons/StopIcon';
import { motion } from 'framer-motion';
import { fastSpring, fastSpringWithDelay } from '../animations';
import styles from './ChatInput.module.css';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import { __ } from '@wordpress/i18n';
import { AnimatedPlaceholder } from './AnimatedPlaceholder';
import { useAgentUIContext } from '../../context/AgentUIContext';
import { cn } from '../../utils/classNames';

interface ActionButton {
	id: string;
	icon: React.ReactNode;
	onClick: () => void;
	variant?: 'primary' | 'ghost' | 'outline' | 'link' | 'icon';
	disabled?: boolean;
	'aria-label': string;
	className?: string;
}

interface ChatInputProps {
	value: string;
	onChange: ( value: string ) => void;
	onSubmit: () => void;
	onKeyDown: ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => void;
	textareaRef: React.RefObject< HTMLTextAreaElement >;
	placeholder?: string | string[];
	isProcessing: boolean;
	onBlur?: () => void;
	onFocus?: () => void;
	onClick?: ( event?: React.MouseEvent< HTMLTextAreaElement > ) => void;
	fromCompact?: boolean;
	onExpand?: () => void;
	showExpandButton?: boolean;
	focusOnMount?: boolean;
	customActions?: ActionButton[];
	actionOrder?: 'before-submit' | 'after-submit';
	onStop?: () => void; // Optional callback for stopping current request
	disabled?: boolean; // Allow disabling submit button for validation
	readOnly?: boolean; // Locks the textarea without disabling the submit/stop button
	className?: string;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	expandOnClick?: boolean;
	layout?: 'inline' | 'stacked';
}

export function ChatInput( {
	value,
	onChange,
	onSubmit,
	onKeyDown,
	textareaRef,
	placeholder = __( 'Ask anything', 'a8c-agenttic' ),
	isProcessing,
	onBlur,
	onFocus,
	onClick,
	fromCompact = false,
	onExpand,
	showExpandButton = true,
	focusOnMount = false,
	customActions = [],
	actionOrder = 'before-submit',
	onStop,
	disabled,
	readOnly,
	onMouseEnter,
	onMouseLeave,
	expandOnClick = false,
	layout = 'inline',
}: ChatInputProps ) {
	const textareaId = useId();
	const { variant, floatingChatState, isInputOverLimit } =
		useAgentUIContext();
	const canSubmit =
		// If the consumer actively sets `disabled` to `false` (vs undefined), that takes precedence.
		disabled !== undefined
			? ! disabled
			: ( value.trim() || isProcessing ) && ! isInputOverLimit;

	const handleTextareaKeyDown = useCallback(
		( e: React.KeyboardEvent< HTMLTextAreaElement > ) => {
			// Normalize key to lowercase for easier comparison
			const key = e.key.toLowerCase();

			// Ignore keydowns from IMEs
			// e.keyCode === 229: Workaround for Mac Safari where the final Enter/Backspace of an IME composition
			// is `isComposing=false`, even though it's technically still part of the composition.
			if (
				key === 'enter' &&
				! e.shiftKey &&
				( e.nativeEvent.isComposing || e.keyCode === 229 )
			) {
				e.preventDefault();
				return;
			}

			// Override onKeyDown based on canSubmit
			// https://linear.app/a8c/issue/DES-306
			if ( key === 'enter' && ! e.shiftKey && ! canSubmit ) {
				e.preventDefault();
				return;
			}

			// A read-only input keeps the stop button active but must not submit.
			if ( readOnly && key === 'enter' && ! e.shiftKey ) {
				e.preventDefault();
				return;
			}

			// Stop undo/redo from bubbling to parent (e.g., Gutenberg editor)
			// Supports: Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Ctrl+Y
			const isUndoOrRedo =
				( ( e.metaKey || e.ctrlKey ) && key === 'z' ) ||
				( e.ctrlKey && key === 'y' );
			if ( isUndoOrRedo ) {
				e.stopPropagation();
			}

			onKeyDown( e );
		},
		[ canSubmit, onKeyDown, readOnly ]
	);

	// Helper function to ensure text has ellipsis
	const addEllipsis = ( text: string ) =>
		text.endsWith( '…' ) ? text : `${ text }…`;

	// Determine if we should use animated placeholder (array) or native placeholder (string)
	const isAnimated = Array.isArray( placeholder );
	let formattedPlaceholder;
	if ( isAnimated ) {
		formattedPlaceholder = placeholder.map( addEllipsis );
	} else if ( placeholder ) {
		formattedPlaceholder = addEllipsis( placeholder );
	} else {
		formattedPlaceholder = '';
	}

	// Set ref value on mount to prevent focus on mount from being triggered again
	const focusOnMountRef = useRef( focusOnMount );

	useEffect( () => {
		if ( focusOnMountRef.current && textareaRef.current ) {
			textareaRef.current.focus();
		}

		// Reset ref value to prevent focus on mount from being triggered again
		focusOnMountRef.current = false;
	}, [ focusOnMountRef, textareaRef ] );

	const renderCustomActions = () => {
		return customActions.map( ( action ) => (
			<span
				key={ action.id }
				className={ cn( styles.actionWrapper, {
					[ styles.actionWrapperDisabled ]: action.disabled,
				} ) }
			>
				<Button
					className={ action.className || styles.button }
					onClick={ action.onClick }
					disabled={ action.disabled }
					variant={ action.variant || 'ghost' }
					icon={ action.icon }
					aria-label={ action[ 'aria-label' ] }
				/>
			</span>
		) );
	};

	const renderExpandButton = () => {
		if ( variant === 'embedded' || floatingChatState === 'expanded' ) {
			return null;
		}
		// Hide the expand button when expandOnClick is true (it will expand automatically on click)
		if ( expandOnClick ) {
			return null;
		}
		return showExpandButton && onExpand ? (
			<Button
				className={ styles.button }
				onClick={ onExpand }
				variant="ghost"
				icon={ <ChevronUpIcon /> }
				aria-label={ __( 'Expand conversation', 'a8c-agenttic' ) }
			/>
		) : null;
	};

	const renderSubmitButton = () => {
		// If there is no onStop callback, don't show the button.
		if ( isProcessing && ! onStop ) {
			return null;
		}

		const handleClick = () => {
			if ( isProcessing && onStop ) {
				onStop();
			} else {
				onSubmit();
			}
		};

		return (
			<Button
				className={ styles.button }
				onClick={ handleClick }
				disabled={ ! canSubmit }
				variant="primary"
				icon={ isProcessing ? <StopIcon /> : <ArrowUpIcon /> }
				aria-label={
					isProcessing
						? __( 'Stop processing', 'a8c-agenttic' )
						: __( 'Send message', 'a8c-agenttic' )
				}
			/>
		);
	};

	return (
		<div
			data-slot="chat-input"
			className={ `${ styles.container }${
				layout === 'stacked' ? ` ${ styles.containerStacked }` : ''
			}` }
			onMouseEnter={ onMouseEnter }
			onMouseLeave={ onMouseLeave }
		>
			<motion.div
				className={ styles.textareaContainer }
				initial={ {
					opacity: 0,
				} }
				animate={ {
					opacity: 1,
					scale: 1,
					transition: value.trim()
						? { duration: 0 }
						: fastSpringWithDelay,
				} }
			>
				{ ! value && isAnimated && (
					<AnimatedPlaceholder
						texts={ formattedPlaceholder as string[] }
					/>
				) }
				<Textarea
					id={ textareaId }
					ref={ textareaRef }
					value={ value }
					readOnly={ readOnly }
					onChange={ ( e ) => onChange( e.target.value ) }
					onKeyDown={ handleTextareaKeyDown }
					onBlur={ onBlur }
					onFocus={ onFocus }
					onClick={ onClick }
					placeholder={
						isAnimated ? '' : ( formattedPlaceholder as string )
					}
					rows={ 1 }
					aria-label={ __( 'Chat input', 'a8c-agenttic' ) }
				/>
			</motion.div>
			<motion.div
				className={ styles.actions }
				initial={ {
					opacity: fromCompact ? 1 : 0,
					scale: fromCompact ? 1 : 0.5,
				} }
				animate={ {
					opacity: 1,
					scale: 1,
					transition: value.trim() ? { duration: 0 } : fastSpring,
				} }
			>
				{ renderExpandButton() }
				{ actionOrder === 'before-submit' && renderCustomActions() }
				{ renderSubmitButton() }
				{ actionOrder === 'after-submit' && renderCustomActions() }
			</motion.div>
		</div>
	);
}

export type { ActionButton };
