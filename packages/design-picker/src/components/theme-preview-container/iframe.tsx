import { useRefEffect } from '@wordpress/compose';
import { createPortal, useState } from '@wordpress/element';
import type { ReactNode } from 'react';

interface IframeProps {
	title: string;
	className?: string;
	children: ReactNode;
}

const Iframe: React.FC< IframeProps > = ( { title, className, children } ) => {
	const [ iframeDocument, setIframeDocument ] = useState< Document >();

	const setRef = useRefEffect( ( node: HTMLIFrameElement ) => {
		function setDocumentIfReady() {
			if ( ! node.contentDocument ) {
				return false;
			}

			const { contentDocument, ownerDocument } = node;
			const { readyState, documentElement } = contentDocument;
			if ( readyState !== 'interactive' && readyState !== 'complete' ) {
				return false;
			}

			setIframeDocument( contentDocument );

			contentDocument.dir = ownerDocument.dir;
			documentElement.removeChild( contentDocument.head );
			documentElement.removeChild( contentDocument.body );

			return true;
		}

		node.addEventListener( 'load', setDocumentIfReady );
		return () => node.removeEventListener( 'load', setDocumentIfReady );
	}, [] );

	return (
		<iframe
			ref={ setRef }
			className={ className }
			title={ title }
			tabIndex={ -1 }
			srcDoc="<!doctype html>"
		>
			{ iframeDocument &&
				createPortal(
					<>
						<head></head>
						<body>{ children }</body>
					</>,
					iframeDocument.documentElement
				) }
		</iframe>
	);
};

export default Iframe;
