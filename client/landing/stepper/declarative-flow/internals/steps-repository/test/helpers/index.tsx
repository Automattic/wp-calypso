// @ts-nocheck - TODO: Fix TypeScript issues
import { SiteIntent } from '@automattic/data-stores/src/onboard';
import { QueryClient } from '@tanstack/react-query';
import React, { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { Step, StepProps } from '../../../types';
import type { Reducer } from 'redux';

export interface RenderStepOptions {
	initialEntry?: string;
	reducers?: Record< string, Reducer >;
	initialState?: unknown;
	queryClient?: QueryClient;
}

/** Utility to render a step for testing purposes */
export const renderStep = ( step: ReactElement< Step >, options?: RenderStepOptions ) => {
	const {
		initialEntry = '/some-path?siteId=123',
		reducers = [],
		initialState = {},
		queryClient,
	} = options ?? {};

	return renderWithProvider(
		<MemoryRouter initialEntries={ [ initialEntry ] }>{ step }</MemoryRouter>,
		{
			initialState,
			queryClient,
			reducers: {
				ui: uiReducer,
				documentHead: documentHeadReducer,
				...reducers,
			},
		}
	);
};

const navigation = {
	submit: jest.fn(),
	goNext: jest.fn(),
	goToStep: jest.fn(),
};

const defaultProps = {
	navigation,
	stepName: 'site-migration-instructions',
	flow: 'site-migration',
	data: {
		siteId: 123,
		siteSlug: 'example.wordpress.com',
		path: '/site-migration-instructions',
		intent: SiteIntent.Build,
		previousStep: 'processing',
	},
};

export const mockStepProps = ( props: Partial< StepProps > = {} ) => {
	return Object.assign( defaultProps, props ) satisfies StepProps;
};
