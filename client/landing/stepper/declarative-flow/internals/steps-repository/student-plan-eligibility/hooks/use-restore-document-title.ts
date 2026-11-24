import { useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { setDocumentHeadTitle } from 'calypso/state/document-head/actions';
import { getDocumentHeadTitle } from 'calypso/state/document-head/selectors/get-document-head-title';

/**
 * Puts back, when the step unmounts, the document title it found on its first render.
 * `DocumentHead` keeps its title after unmounting, so the next step would show it otherwise.
 */
export function useRestoreDocumentTitle() {
	const dispatch = useDispatch();
	const titleOnEntry = useRef( useSelector( getDocumentHeadTitle ) );

	// A layout effect, so the reset runs before the next step's own `DocumentHead` sets a title.
	useLayoutEffect(
		() => () => {
			dispatch( setDocumentHeadTitle( titleOnEntry.current ?? '' ) );
		},
		[ dispatch ]
	);
}
