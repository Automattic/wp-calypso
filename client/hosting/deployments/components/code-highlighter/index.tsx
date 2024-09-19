import Prism from 'prismjs';
import { useEffect, useRef } from 'react';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-yaml';

import './style.scss';

interface CodeHighlighterProps {
	content: string;
}

export const CodeHighlighter = ( { content }: CodeHighlighterProps ) => {
	const yamlCodeRef = useRef< HTMLElement | null >( null );

	useEffect( () => {
		if ( yamlCodeRef.current ) {
			Prism.highlightElement( yamlCodeRef.current );
		}
	}, [ content ] );

	return (
		<>
			<pre className="github-workflow-code-highlighter">
				<code ref={ yamlCodeRef } className="language-yaml">
					{ content }
				</code>
			</pre>
		</>
	);
};
