import { createComponentImplementation, useMarkdownRenderer } from '@a2ui/react/v0_9';
import { DataBindingSchema, TextApi } from '@a2ui/web_core/v0_9';
import { RawHTML, useEffect, useState } from '@wordpress/element';
import { z } from 'zod';

const dynamicString = z.union( [ z.string(), DataBindingSchema ] );

const Text = createComponentImplementation(
	{
		name: TextApi.name,
		schema: TextApi.schema.pick( { text: true } ).extend( { text: dynamicString } ),
	},
	( { props } ) => {
		const text = props.text ?? '';
		const renderer = useMarkdownRenderer();
		const [ html, setHtml ] = useState< string >();
		useEffect( () => {
			let active = true;
			setHtml( undefined );
			if ( renderer ) {
				void renderer( text ).then(
					( value ) => active && setHtml( value ),
					() => {}
				);
			}
			return () => {
				active = false;
			};
		}, [ text, renderer ] );
		return html === undefined ? <span>{ text }</span> : <RawHTML>{ html }</RawHTML>;
	}
);

export default Text;
