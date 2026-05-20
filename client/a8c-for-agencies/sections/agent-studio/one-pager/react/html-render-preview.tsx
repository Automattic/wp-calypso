import { useEffect, useRef, useState } from 'react';
import { prepareElaRenderElement } from '../engine/render-png';
import { ELA_PAGE_HEIGHT, ELA_PAGE_WIDTH } from '../engine/types';

import './html-render-preview.scss';

interface Props {
	html: string;
	/**
	 * Display width in pixels. The page renders at native 816×1056 and is
	 * uniformly scaled to fit this width.
	 */
	width: number;
	className?: string;
}

/**
 * Mounts an Ela page HTML string in a scoped container and scales it to fit
 * the requested display width. Runs the same fit pipeline the PNG renderer
 * uses so the on-screen preview matches the exported PDF.
 */
export default function HtmlRenderPreview( { html, width, className }: Props ) {
	const containerRef = useRef< HTMLDivElement >( null );
	const [ scale, setScale ] = useState( 1 );

	useEffect( () => {
		setScale( width / ELA_PAGE_WIDTH );
	}, [ width ] );

	useEffect( () => {
		const node = containerRef.current;
		if ( ! node ) {
			return;
		}
		let cancelled = false;
		( async () => {
			await prepareElaRenderElement( node );
			if ( cancelled ) {
				return;
			}
		} )();
		return () => {
			cancelled = true;
		};
	}, [ html ] );

	return (
		<div
			className={ `a4a-one-pager-preview${ className ? ' ' + className : '' }` }
			style={ {
				width: `${ width }px`,
				height: `${ ELA_PAGE_HEIGHT * scale }px`,
			} }
		>
			<div
				ref={ containerRef }
				className="a4a-one-pager-preview__inner"
				style={ {
					transform: `scale(${ scale })`,
					transformOrigin: 'top left',
					width: `${ ELA_PAGE_WIDTH }px`,
					height: `${ ELA_PAGE_HEIGHT }px`,
				} }
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html: html } }
			/>
		</div>
	);
}
