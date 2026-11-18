import {
	useSelector as reduxUseSelector,
	useDispatch as reduxUseDispatch,
	useStore as reduxUseStore,
} from 'react-redux';
import { IAppState, CalypsoDispatch } from './types';
import type { AnyAction, Store } from 'redux';

export const useDispatch: () => CalypsoDispatch = reduxUseDispatch;

// Basically the same types as TypedUseSelectorHook but with IAppState as the default state type.
export function useSelector< State = IAppState, Selected = unknown >(
	selector: ( state: State ) => Selected,
	equalityFn?: ( a: Selected, b: Selected ) => boolean
): Selected {
	return reduxUseSelector( selector, equalityFn );
}

export function useStore(): Store< IAppState, AnyAction > {
	return reduxUseStore< IAppState >();
}
