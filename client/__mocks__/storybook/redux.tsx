import React, { FC } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

/**
 * Store mock for DocumentHead.
 * @see https://github.com/Automattic/wp-calypso/blob/2186d1580ada4812c72eaa1fe799f90efa0b9642/client/components/data/document-head/index.jsx#L17
 */
export const documentHeadStoreMock = {
	documentHead: { title: 'title' },
	ui: { section: '', selectedSiteId: 0 },
};

const mockStore = configureStore();

export const ReduxDecorator: FC< {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	store: Record< string, any >;
	children: React.ReactNode;
} > = ( { children, store } ) => {
	const _store = mockStore( {
		...store,
	} );
	return <Provider store={ _store }>{ children }</Provider>;
};
