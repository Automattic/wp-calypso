/**
 * Publishes the site editor's router history for the `editor-navigate`
 * ability, whose callback is a plain function and cannot read React context.
 */

import { useEffect } from '@wordpress/element';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { setEditorHistory, type EditorHistory } from '../../utils/editor-history';
import { unlock } from '../../utils/private-apis';

function unlockRouterHistory(): ( () => EditorHistory ) | undefined {
	try {
		if ( unlock ) {
			return unlock< { useHistory: () => EditorHistory } >( routerPrivateApis ).useHistory;
		}
	} catch {
		// The router's private APIs are locked by another copy of `@wordpress/private-apis`.
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
