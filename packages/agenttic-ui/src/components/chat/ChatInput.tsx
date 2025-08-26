import React, { useEffect, useId, useRef } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ArrowUpIcon } from '../icons/ArrowUpIcon';
import { StopIcon } from '../icons/StopIcon';
import { motion } from 'framer-motion';
import { fastSpring, fastSpringWithDelay } from '../animations';
import { DEFAULT_PLACEHOLDER } from '../../types';
import styles from './ChatInput.module.css';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import { __ } from '@wordpress/i18n';

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
	placeholder?: string;
	isProcessing: boolean;
	onBlur?: () => void;
	fromCompact?: boolean;
	onExpand?: () => void;
	showExpandButton?: boolean;
	focusOnMount?: boolean;
	customActions?: ActionButton[];
	actionOrder?: 'before-submit' | 'after-submit';
}

export function ChatInput( {
	value,
	onChange,
	onSubmit,
	onKeyDown,
	textareaRef,
	placeholder = DEFAULT_PLACEHOLDER,
	isProcessing,
	onBlur,
	fromCompact = false,
	onExpand,
	showExpandButton = true,
	focusOnMount = false,
	customActions = [],
	actionOrder = 'before-submit',
}: ChatInputProps ) {
	const textareaId = useId();
	const canSubmit = value.trim() || isProcessing;
	const displayPlaceholder = placeholder.endsWith( '…' )
		? placeholder
		: `${ placeholder }…`;

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
			<Button
				key={ action.id }
				className={ action.className || styles.button }
				onClick={ action.onClick }
				disabled={ action.disabled }
				variant={ action.variant || 'ghost' }
				icon={ action.icon }
				aria-label={ action[ 'aria-label' ] }
			/>
		) );
	};

	const renderExpandButton = () => {
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
		return (
			<Button
				className={ styles.button }
				onClick={ onSubmit }
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
		<div data-slot="chat-input" className={ styles.container }>
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
				<Textarea
					id={ textareaId }
					ref={ textareaRef }
					value={ value }
					onChange={ ( e ) => onChange( e.target.value ) }
					onKeyDown={ onKeyDown }
					onBlur={ onBlur }
					placeholder={ displayPlaceholder }
					rows={ 1 }
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
