import { TextareaControl } from '@wordpress/components';
import { useEffect, useRef, useState } from 'react';
import './dnssec-record-textarea.scss';

interface DnsSecRecordTextareaProps {
	value: string;
	label: string;
}

const MIN_ROWS = 2;

export function DnsSecRecordTextarea( { value, label }: DnsSecRecordTextareaProps ) {
	const textareaRef = useRef< HTMLTextAreaElement >( null );
	const [ textareaRows, setTextareaRows ] = useState< number >( MIN_ROWS );

	// Calculate and set textarea rows
	const updateTextareaRows = () => {
		const textareaElement = textareaRef.current;
		if ( ! textareaElement ) {
			return;
		}

		// Calculate the required rows
		const style = window.getComputedStyle( textareaElement );
		const lineHeight = ! isNaN( parseInt( style.lineHeight ) ) ? parseInt( style.lineHeight ) : 20;
		const rows = Math.floor( textareaElement.scrollHeight / lineHeight );

		// Set to latest rows
		textareaElement.rows = Math.max( rows, MIN_ROWS );
		setTextareaRows( textareaElement.rows );
	};

	// Update textarea rows on mount and when value changes
	useEffect( () => {
		updateTextareaRows();
	}, [ value ] );

	// Handle window resize to re-adjust textarea rows
	useEffect( () => {
		window.addEventListener( 'resize', updateTextareaRows );

		// Cleanup event listener on unmount
		return () => {
			window.removeEventListener( 'resize', updateTextareaRows );
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
			rows={ textareaRows }
			__nextHasNoMarginBottom
			className="dnssec-record-textarea"
		/>
	);
}
