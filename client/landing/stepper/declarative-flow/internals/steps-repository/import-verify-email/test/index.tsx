/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { screen } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useSelector } from 'react-redux';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import ImportVerifyEmail from '..';
import { StepProps } from '../../../types';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: jest.fn(),
} ) );

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <ImportVerifyEmail { ...combinedProps } />, renderOptions );
};

describe( 'ImportVerifyEmail', () => {
	beforeAll( () => {
		nock.disableNetConnect();
		( useSelector as jest.Mock ).mockReturnValue( { email_verified: false } );
		( useSite as jest.Mock ).mockReturnValue( { domain: 'example.wordpress.com' } );
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
