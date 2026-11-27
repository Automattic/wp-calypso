/**
 * @vitest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { screen } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useSelector } from 'react-redux';
import { type Mock, vi } from 'vitest';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import ImportVerifyEmail from '..';
import { StepProps } from '../../../types';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';

vi.mock( 'react-redux', async () => ( {
	...( await vi.importActual< typeof import( 'react-redux' ) >( 'react-redux' ) ),
	useSelector: vi.fn(),
} ) );

vi.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: vi.fn(),
} ) );

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <ImportVerifyEmail { ...combinedProps } />, renderOptions );
};

describe( 'ImportVerifyEmail', () => {
	beforeAll( () => {
		nock.disableNetConnect();
		( useSelector as Mock ).mockReturnValue( { email_verified: false } );
		( useSite as Mock ).mockReturnValue( { domain: 'example.wordpress.com' } );
	} );

	test( 'show <Interval> by default', () => {
		render();
		expect( screen.getByTestId( 'email-verification-interval' ) ).toBeInTheDocument();
	} );

	test( "don't show <Interval> when pollForEmailVerification is false", () => {
		render( { data: { pollForEmailVerification: false } } );
		expect( screen.queryByTestId( 'email-verification-interval' ) ).not.toBeInTheDocument();
	} );

	test( 'show <Interval> when pollForEmailVerification is true', () => {
		render( { data: { pollForEmailVerification: true } } );
		expect( screen.getByTestId( 'email-verification-interval' ) ).toBeInTheDocument();
	} );
} );
