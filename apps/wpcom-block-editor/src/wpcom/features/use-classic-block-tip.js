/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import url from 'url';
import { translate } from 'i18n-calypso';
import { registerPlugin } from '@wordpress/plugins';
import { Popover } from '@wordpress/components';
import { __experimentalMainDashboardButton as MainDashboardButton } from '@wordpress/interface';
/* eslint-enable import/no-extraneous-dependencies */

const parsedEditorUrl = url.parse( globalThis.location.href, true );

const ClassicBlockTip = () => {
	return (
		<MainDashboardButton>
			<Popover position="bottom left" noArrow={ false }>
				<h2>{ translate( 'Add the Classic block' ) }</h2>
				<p>
					{ translate(
						"To use the Classic block in the future, click here, then search for 'classic'; and click to insert the block"
					) }
				</p>
			</Popover>
		</MainDashboardButton>
	);
};

// Hard coding this value for now - query string can be passed in from client/gutenberg/editor/calypsoify-iframe.tsx
parsedEditorUrl.query[ 'show-classic-block-guide' ] = true;

// Check if the experimental slot is available before to register plugin.
if (
	typeof MainDashboardButton !== 'undefined' &&
	parsedEditorUrl.query[ 'show-classic-block-guide' ]
) {
	registerPlugin( 'block-inserter-classic-contextual-tip', {
		render() {
			return <ClassicBlockTip />;
		},
	} );
}
