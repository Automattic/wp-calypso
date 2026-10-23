import { createComponentImplementation, useMarkdownRenderer } from '@a2ui/react';
import { RawHTML, useEffect, useState } from '@wordpress/element';
import { z } from 'zod';
import { StringValueSchema } from '../utils/schemas';

export const Text = createComponentImplementation(
	{
		name: 'Text',
		schema: z.object( { text: StringValueSchema } ),
	},
	( { props } ) => {
		const text = props.text ?? '';
		const renderMarkdown = useMarkdownRenderer();
		const [ html, setHtml ] = useState< string >();

		useEffect( () => {
			let isCurrent = true;
			setHtml( undefined );

			if ( renderMarkdown ) {
				void renderMarkdown( text ).then(
					( value ) => isCurrent && setHtml( value ),
					() => {}
				);
			}

			return () => {
				isCurrent = false;
			};
		}, [ text, renderMarkdown ] );

		return html === undefined ? <span>{ text }</span> : <RawHTML>{ html }</RawHTML>;
	}
);
