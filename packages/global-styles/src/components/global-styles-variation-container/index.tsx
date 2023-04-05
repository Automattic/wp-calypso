import {
	__unstableIframe as Iframe,
	__unstableEditorStyles as EditorStyles,
} from '@wordpress/block-editor';
import { useGlobalStylesOutput } from '@wordpress/edit-site/build-module/components/global-styles/use-global-styles-output';
import { useMemo } from 'react';
import './style.scss';

interface Props {
	width: number | null;
	height: number;
	inlineCss?: string;
	containerResizeListener: JSX.Element;
	children: JSX.Element;
}

const GlobalStylesVariationContainer = ( {
	width,
	height,
	inlineCss,
	containerResizeListener,
	children,
	...props
}: Props ) => {
	const [ styles ] = useGlobalStylesOutput();

	// Reset leaked styles from WP common.css and remove main content layout padding and border.
	const editorStyles = useMemo( () => {
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
			head={ <EditorStyles styles={ editorStyles } /> }
			style={ {
				height,
				visibility: width ? 'visible' : 'hidden',
			} }
			tabIndex={ -1 }
			scrolling="no"
			{ ...props }
		>
			{ containerResizeListener }
			{ children }
		</Iframe>
	);
};

export default GlobalStylesVariationContainer;
