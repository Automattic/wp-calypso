import { useCallback, useEffect, useRef } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { STORE_NAME } from '../store';
import type { StoreActions, StoreSelectors, UseInputReturn } from '../types';

interface UseInputProps {
	onSubmit: ( value: string ) => void;
	isProcessing: boolean;
}

export function useInput( {
	onSubmit,
	isProcessing,
}: UseInputProps ): UseInputReturn {
	const { setInputValue } = useDispatch( STORE_NAME ) as StoreActions;

	const value = useSelect( ( select ) => {
		const store = select( STORE_NAME ) as StoreSelectors;
		return store.getInputValue();
	}, [] );

	const setValue = useCallback(
		( newValue: string ) => {
			setInputValue( newValue );
		},
		[ setInputValue ]
	);

	const textareaRef = useRef< HTMLTextAreaElement >( null );

	const clear = useCallback( () => {
		setValue( '' );
		if ( textareaRef.current ) {
			textareaRef.current.style.height = 'auto';
			setTimeout( () => {
				textareaRef.current?.focus();
			}, 100 );
		}
	}, [ setValue ] );

	const adjustHeight = useCallback( () => {
		const textarea = textareaRef.current;
		if ( ! textarea ) {
			return;
		}

		// Reset height to auto to get the correct scrollHeight
		textarea.style.height = 'auto';

		// Set height to scrollHeight, with min and max constraints
		const scrollHeight = textarea.scrollHeight;
		const minHeight = 40; // ~1 line
		const maxHeight = 200; // ~8 lines

		textarea.style.height = `${ Math.min(
			Math.max( scrollHeight, minHeight ),
			maxHeight
		) }px`;
	}, [] );

	const handleKeyDown = useCallback(
		( e: React.KeyboardEvent< HTMLTextAreaElement > ) => {
			// Submit on Enter (without shift)
			if (
				e.key === 'Enter' &&
				! e.shiftKey &&
				! isProcessing &&
				value.trim()
			) {
				e.preventDefault();
				onSubmit( value.trim() );
				clear();
			}
		},
		[ value, isProcessing, onSubmit, clear ]
	);

	// Adjust height when value changes
	useEffect( () => {
		adjustHeight();
	}, [ value, adjustHeight ] );

	return {
		value,
		setValue,
		clear,
		textareaRef,
		handleKeyDown,
		adjustHeight,
	};
}
