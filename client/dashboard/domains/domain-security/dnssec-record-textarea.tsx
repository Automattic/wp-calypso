import { TextareaControl } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';
import './dnssec-record-textarea.scss';

interface DnsSecRecordTextareaProps {
	value: string;
	label: string;
}

export function DnsSecRecordTextarea( { value, label }: DnsSecRecordTextareaProps ) {
	const textareaRef = useRef< HTMLTextAreaElement >( null );

	// Auto-resize textarea function
	const autoResizeTextarea = ( textarea: HTMLTextAreaElement ) => {
		textarea.style.height = 'auto';
		textarea.style.height = textarea.scrollHeight + 'px';
	};

	// Auto-resize on mount and when value changes
	useEffect( () => {
		if ( textareaRef.current ) {
			autoResizeTextarea( textareaRef.current );
		}
	}, [ value ] );

	// Handle window resize to re-adjust textarea height
	useEffect( () => {
		const handleResize = () => {
			if ( textareaRef.current ) {
				autoResizeTextarea( textareaRef.current );
			}
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
			onInput={ ( event ) => autoResizeTextarea( event.target as HTMLTextAreaElement ) }
		/>
	);
}
