/**
 * Publishes the site editor's router history for the `editor-navigate`
 * ability, whose callback is a plain function and cannot read React context.
 */

import { useEffect } from '@wordpress/element';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { setEditorHistory, type EditorHistory } from '../../utils/editor-history';

// WordPress has changed this wording; older versions expect the second.
const CONSENT_STRINGS = [
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'I know using unstable features means my theme or plugin will inevitably break in the next version of WordPress.',
];

function unlockRouterHistory(): ( () => EditorHistory ) | undefined {
	for ( const consent of CONSENT_STRINGS ) {
		try {
			const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
				consent,
				'@wordpress/edit-site'
			) as { unlock: ( apis: unknown ) => { useHistory: () => EditorHistory } };
			return unlock( routerPrivateApis ).useHistory;
		} catch {
			// Wrong wording for this WordPress; try the next.
		}
	}

	// eslint-disable-next-line no-console
	console.warn(
		'[AgentsManager] The editor router is unavailable; navigation will reload the page.'
	);
	return undefined;
}

const useRouterHistory = unlockRouterHistory();

function PublishHistory( { useHistory }: { useHistory: () => EditorHistory } ) {
	const history = useHistory();

	useEffect( () => {
		setEditorHistory( history );
		return () => setEditorHistory( undefined );
	}, [ history ] );

	return null;
}

export default function EditorHistoryBridge() {
	if ( ! useRouterHistory ) {
		return null;
	}

	return <PublishHistory useHistory={ useRouterHistory } />;
}
