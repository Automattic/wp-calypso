import {
	__unstableIframe as Iframe,
	__unstableEditorStyles as EditorStyles,
} from '@wordpress/block-editor';
import { useRefEffect } from '@wordpress/compose';
import { useMemo } from 'react';
import { useSafeGlobalStylesOutput } from '../../gutenberg-bridge';
import './style.scss';

interface Props {
	width: number | null;
	height: number;
	inlineCss?: string;
	containerResizeListener: JSX.Element;
	children: JSX.Element;
	onFocusOut?: () => void;
}

const GlobalStylesVariationContainer = ( {
	width,
	height,
	inlineCss,
	containerResizeListener,
	children,
	onFocusOut,
	...props
}: Props ) => {
	const [ styles ] = useSafeGlobalStylesOutput();
	// Reset leaked styles from WP common.css and remove main content layout padding and border.
	const editorStyles = useMemo( () => {
		console.log( 'editorStyles:', { styles } );

		if ( styles ) {
			return [
				...styles,
				...( inlineCss
					? [
							{
								css: inlineCss,
								isGlobalStyles: true,
							},
					  ]
					: [] ),
				{
					css: 'html{overflow:hidden}body{min-width: 0;padding: 0;border: none;transform:scale(1);}',
					isGlobalStyles: true,
				},
			];
		}
		return styles;
	}, [ styles ] );
	return (
		<Iframe
			className="global-styles-variation-container__iframe"
			style={ {
				height,
				visibility: width ? 'visible' : 'hidden',
			} }
			tabIndex={ -1 }
			contentRef={ useRefEffect( ( bodyElement ) => {
				// Disable moving focus to the writing flow wrapper if the focus disappears
				// See https://github.com/WordPress/gutenberg/blob/aa8e1c52c7cb497e224a479673e584baaca97113/packages/block-editor/src/components/writing-flow/use-tab-nav.js#L136
				const handleFocusOut = ( event: Event ) => {
					event.stopImmediatePropagation();
					// Explicitly call the focusOut handler, if available.
					onFocusOut?.();
				};
				bodyElement.addEventListener( 'focusout', handleFocusOut );
				return () => {
					bodyElement.removeEventListener( 'focusout', handleFocusOut );
				};
			}, [] ) }
			scrolling="no"
			{ ...props }
		>
			<EditorStyles styles={ editorStyles ?? [] } />
			{ containerResizeListener }
			{ children }
		</Iframe>
	);
};

export default GlobalStylesVariationContainer;
