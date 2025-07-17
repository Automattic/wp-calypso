import { useCallback, useEffect, useState } from 'react';
import type { ChatState, UseChatReturn } from '../types';

export function useChat( chatState?: ChatState ): UseChatReturn {
	const [ state, setState ] = useState< ChatState >(
		chatState || 'collapsed'
	);

	useEffect( () => {
		if ( chatState !== undefined ) {
			setState( chatState );
		}
	}, [ chatState ] );

	const isOpen = state !== 'collapsed';

	const open = useCallback( () => {
		setState( 'compact' );
	}, [] );

	const close = useCallback( () => {
		setState( 'collapsed' );
	}, [] );

	const toggle = useCallback( () => {
		setState( ( prev ) =>
			prev === 'collapsed' ? 'compact' : 'collapsed'
		);
	}, [] );

	return {
		state,
		setState,
		isOpen,
		open,
		close,
		toggle,
	};
}
