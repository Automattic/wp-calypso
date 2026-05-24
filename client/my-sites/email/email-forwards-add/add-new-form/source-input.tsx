import { __experimentalInputControl as InputControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import type { SourceInputProps } from './types';
import './styles.scss';

export function SourceInput( props: SourceInputProps ) {
	const { onChange, suffix, value, disabled } = props;
	const translate = useTranslate();
	const [ highlightSuffix, setHighlightSuffix ] = React.useState( 0 );

	return (
		<div className="email-forwarding__mailbox-input-wrapper">
			<InputControl
				__next40pxDefaultSize
				label={ translate( 'Forward from' ) }
				className="email-forwarding__mailbox-input"
				name="mailbox"
				maxLength={ 64 }
				value={ value }
				disabled={ disabled }
				onChange={ ( next ) => onChange( ( next ?? '' ).replace( /@.*/gi, '' ) ) }
				onKeyUp={ ( event ) => {
					if ( event.key === '@' ) {
						setHighlightSuffix( ( s ) => s + 1 );
					}
				} }
				suffix={
					/* Blink the suffix when the user enters @ */
					<span
						key={ highlightSuffix }
						className={ clsx( 'email-forwarding__mailbox-suffix', {
							animate: highlightSuffix,
						} ) }
					>
						{ suffix }
					</span>
				}
			/>
		</div>
	);
}
