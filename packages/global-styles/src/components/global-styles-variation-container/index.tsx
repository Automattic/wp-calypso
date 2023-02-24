import {
	__unstableIframe as Iframe,
	__unstableEditorStyles as EditorStyles,
} from '@wordpress/block-editor';
import { useGlobalStylesOutput } from '@wordpress/edit-site/build-module/components/global-styles/use-global-styles-output';
import { useMemo } from 'react';
import { STYLE_PREVIEW_HEIGHT } from '../../constants';
import './style.scss';

interface Props {
	width: number | null;
	ratio: number;
	containerResizeListener: JSX.Element;
	children: JSX.Element;
}

const GlobalStylesVariationContainer = ( {
	width,
	ratio,
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
				{
					css: 'html{overflow:hidden}body{min-width: 0;padding: 0;border: none;}',
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
				height: Math.ceil( STYLE_PREVIEW_HEIGHT * ratio ),
				visibility: ! width ? 'hidden' : 'visible',
			} }
			tabIndex={ -1 }
			{ ...props }
		>
			{ containerResizeListener }
			{ children }
		</Iframe>
	);
};

export default GlobalStylesVariationContainer;
