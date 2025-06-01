// @ts-nocheck - TODO: Fix TypeScript issues
import { SiteIntent } from '@automattic/data-stores/src/onboard';
import { merge } from 'lodash';
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
}

/** Utility to render a step for testing purposes */
export const renderStep = ( step: ReactElement< Step >, options?: RenderStepOptions ) => {
	const {
		initialEntry = '/some-path?siteId=123',
		reducers = [],
		initialState = {},
	} = options ?? {};

	return renderWithProvider(
		<MemoryRouter initialEntries={ [ initialEntry ] }>{ step }</MemoryRouter>,
		{
			initialState,
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
	return merge( defaultProps, props ) satisfies StepProps;
};
