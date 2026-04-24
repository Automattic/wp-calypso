/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { render, screen } from '@testing-library/react';
import NextAdventureStep from '../next-adventure-step';

jest.mock( '@automattic/calypso-config', () => {
	const isEnabled = jest.fn();
	return { __esModule: true, default: { isEnabled }, isEnabled };
} );

const SUBTITLE = 'Before you go, please answer a quick question to help us improve WordPress.com.';

describe( 'NextAdventureStep', () => {
	beforeEach( () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( true );
	} );

	it( 'shows "Cancelation confirmed" title with subtitle when isOnlyStep and cancel intent', () => {
		render(
			<NextAdventureStep isPlan={ false } isOnlyStep adventureOptions={ [] } intent="cancel" />
		);
		expect( screen.getByRole( 'heading', { name: /Cancelation confirmed/ } ) ).toBeVisible();
		expect( screen.getByText( SUBTITLE ) ).toBeVisible();
	} );

	it( 'shows "Share your feedback" title with subtitle when isOnlyStep and remove intent', () => {
		render(
			<NextAdventureStep isPlan={ false } isOnlyStep adventureOptions={ [] } intent="remove" />
		);
		expect( screen.getByRole( 'heading', { name: /Share your feedback/ } ) ).toBeVisible();
		expect( screen.getByText( SUBTITLE ) ).toBeVisible();
	} );

	it( 'shows "Thanks for your feedback" title without subtitle in multi-step cancel flow', () => {
		render(
			<NextAdventureStep
				isPlan={ false }
				isOnlyStep={ false } // must be explicit to override default undefined
				adventureOptions={ [] }
				intent="cancel"
			/>
		);
		expect( screen.getByRole( 'heading', { name: /Thanks for your feedback/ } ) ).toBeVisible();
		expect( screen.queryByText( SUBTITLE ) ).not.toBeInTheDocument();
	} );

	it( 'shows "One last thing" title without subtitle in multi-step remove flow', () => {
		render(
			<NextAdventureStep
				isPlan={ false }
				isOnlyStep={ false } // must be explicit to override default undefined
				adventureOptions={ [] }
				intent="remove"
			/>
		);
		expect( screen.getByRole( 'heading', { name: /One last thing/ } ) ).toBeVisible();
		expect( screen.queryByText( SUBTITLE ) ).not.toBeInTheDocument();
	} );
} );
