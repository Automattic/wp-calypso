/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import url from 'url';
import { translate } from 'i18n-calypso';
import { registerPlugin } from '@wordpress/plugins';
import { Tip } from '@wordpress/components';
import { __experimentalInserterMenuExtension as InserterMenuExtension } from '@wordpress/block-editor';
/* eslint-enable import/no-extraneous-dependencies */

const parsedEditorUrl = url.parse( globalThis.location.href, true );

const ClassicBlockTip = () => {
	return (
		<InserterMenuExtension>
			<Tip>
				<p>{ translate( 'Say hello to the Classic block' ) }</p>
			</Tip>
		</InserterMenuExtension>
	);
};

// Hard coding this value for now - query string can be passed in from client/gutenberg/editor/calypsoify-iframe.tsx
parsedEditorUrl.query[ 'show-classic-block-guide' ] = true;

// Check if the experimental slot is available before to register plugin.
if (
	typeof InserterMenuExtension !== 'undefined' &&
	parsedEditorUrl.query[ 'show-classic-block-guide' ]
) {
	registerPlugin( 'block-inserter-classic-contextual-tip', {
		render() {
			return <ClassicBlockTip />;
		},
	} );
}
