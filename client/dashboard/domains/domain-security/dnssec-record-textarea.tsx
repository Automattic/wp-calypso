import { TextareaControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import './dnssec-record-textarea.scss';

interface DnsSecRecordTextareaProps {
	value: string;
	label: string;
}

export function DnsSecRecordTextarea( { value, label }: DnsSecRecordTextareaProps ) {
	const textareaRef = useRef< HTMLTextAreaElement >( null );
	const [ textareaHeight, setTextareaHeight ] = useState< number >( 0 );

	// Calculate and set textarea height
	const updateTextareaHeight = () => {
		if ( textareaRef.current ) {
			const textarea = textareaRef.current;
			// Reset height to auto to get the correct scrollHeight
			textarea.style.height = 'auto';
			const newHeight = textarea.scrollHeight;
			setTextareaHeight( newHeight );
		}
	};

	// Update height on mount and when value changes
	useEffect( () => {
		updateTextareaHeight();
	}, [ value ] );

	// Handle window resize to re-adjust textarea height
	useEffect( () => {
		const handleResize = () => {
			updateTextareaHeight();
		};

		window.addEventListener( 'resize', handleResize );

		// Cleanup event listener on unmount
		return () => {
			window.removeEventListener( 'resize', handleResize );
		};
	}, [] );

	return (
		<TextareaControl
			ref={ textareaRef }
			value={ value }
			onChange={ () => {} }
			label={ label }
			disabled
			readOnly
			rows={ 1 }
			__nextHasNoMarginBottom
			className="dnssec-record-textarea"
			style={ { '--textarea-height': `${ textareaHeight }px` } as React.CSSProperties }
			onInput={ updateTextareaHeight }
		/>
	);
}
