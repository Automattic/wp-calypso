import React, { useEffect, useId } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ArrowUpIcon } from '../icons/ArrowUpIcon';
import { StopIcon } from '../icons/StopIcon';
import { motion } from 'framer-motion';
import { fastSpring, fastSpringWithDelay } from '../animations';
import { DEFAULT_PLACEHOLDER } from '../../types';
import styles from './ChatInput.module.css';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';

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
}: ChatInputProps ) {
	const textareaId = useId();
	const canSubmit = value.trim() || isProcessing;
	const displayPlaceholder = placeholder.endsWith( '…' )
		? placeholder
		: `${ placeholder }…`;

	useEffect( () => {
		if ( focusOnMount && textareaRef.current ) {
			textareaRef.current.focus();
		}
	}, [] ); // Empty dependency array - only run on mount

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
				{ showExpandButton && onExpand && (
					<Button
						className={ `${ styles.button } ${ styles.expandButton }` }
						onClick={ onExpand }
						variant="ghost"
						icon={ <ChevronUpIcon /> }
						aria-label="Expand conversation"
					/>
				) }
				<Button
					className={ styles.button }
					onClick={ onSubmit }
					disabled={ ! canSubmit }
					variant="primary"
					icon={ isProcessing ? <StopIcon /> : <ArrowUpIcon /> }
				/>
			</motion.div>
		</div>
	);
}
