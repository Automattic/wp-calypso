import { __experimentalVStack as VStack } from '@wordpress/components';
import { useSelector } from 'calypso/state';
import { getPreference } from 'calypso/state/preferences/selectors';
import { READER_QUICK_POST_MINIMIZED_PREFERENCE } from '../constants';
import type { JSX } from 'react';

import './style.scss';

export function QuickPostSkeleton(): JSX.Element {
	// Match the collapsed editor's height when the user has minimized it, so the
	// skeleton doesn't flash the full-height editor before the bundle loads and
	// collapses it. `getPreference` returns null until remote preferences load,
	// which falls back to the expanded skeleton — the same as the default state.
	const isMinimized = Boolean(
		useSelector( ( state ) => getPreference( state, READER_QUICK_POST_MINIMIZED_PREFERENCE ) )
	);

	if ( isMinimized ) {
		return (
			<VStack className="quick-post-skeleton" spacing={ 4 }>
				<span style={ { width: '160px', height: '36px' } }></span>
			</VStack>
		);
	}

	return (
		<VStack className="quick-post-skeleton" spacing={ 4 }>
			<span style={ { width: '60px', height: '54px' } }></span>
			<span style={ { width: '100%', height: '136px' } }></span>
			<span style={ { width: '100%', height: '36px' } }></span>
		</VStack>
	);
}
