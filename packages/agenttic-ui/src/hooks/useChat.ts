import { useCallback, useEffect, useState } from 'react';
import type { ChatState, UseChatReturn } from '../types';

export function useChat( chatState?: ChatState ): UseChatReturn {
	const initialState = chatState || 'collapsed';
	const [ state, setState ] = useState< ChatState >( initialState );

	useEffect( () => {
		if ( chatState !== undefined ) {
			setState( chatState );
		}
	}, [ chatState ] );

	const isOpen = state !== 'collapsed' && state !== 'compact';

	const open = useCallback( () => {
		setState( 'expanded' );
	}, [] );

	const close = useCallback( () => {
		setState( initialState );
	}, [ initialState ] );

	const toggle = useCallback( () => {
		setState( ( prev ) =>
			prev === 'collapsed' ? 'compact' : 'collapsed'
		);
	}, [] );

	return {
		state,
		initialState,
		setState,
		isOpen,
		open,
		close,
		toggle,
	};
}
