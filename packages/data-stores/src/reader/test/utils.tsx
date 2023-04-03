import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

export const client = new QueryClient();
export const Parent = ( { children } ) => (
	<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
);

// Builds the test object
export const buildSkeleton = ( mutation: any, payload: any ) => {
	const Skeleton = () => {
		const { mutate } = mutation();
		useEffect( () => {
			mutate( payload );
		}, [ mutate ] );

		return <></>;
	};

	return Skeleton;
};

export const resetMocks = () => {
	jest.resetAllMocks();
};
