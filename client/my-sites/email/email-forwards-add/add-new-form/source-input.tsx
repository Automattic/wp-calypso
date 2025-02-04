import { TextControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import type { SourceInputProps } from './types';
import './styles.scss';

export function SourceInput( props: SourceInputProps ) {
	const { onChange, suffix, ...rest } = props;
	const translate = useTranslate();
	const [ highlightSuffix, setHighlightSuffix ] = React.useState( 0 );

	return (
		<div className="email-forwarding__mailbox-input-wrapper">
			<TextControl
				label={ translate( 'Forward from' ) }
				className="email-forwarding__mailbox-input"
				name="mailbox"
				maxLength={ 64 }
				onChange={ ( value ) => onChange( value.replace( /@.*/gi, '' ) ) }
				onKeyUp={ ( event ) => {
					if ( event.key === '@' ) {
						setHighlightSuffix( ( s ) => s + 1 );
					}
				} }
				{ ...rest }
			/>
			{ /* Blink the suffix when the user enters @ */ }
			<p
				key={ highlightSuffix }
				className={ clsx( 'email-forwarding__mailbox-suffix', { animate: highlightSuffix } ) }
			>
				{ suffix }
			</p>
		</div>
	);
}
