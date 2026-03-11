/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { logToLogstash } from 'calypso/lib/logstash';
import { render } from '../../../test-utils';
import { InaccessibleJetpackNotice } from '../notices';

jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

const mockedLogToLogstash = jest.mocked( logToLogstash );

describe( '<InaccessibleJetpackNotice>', () => {
	test( 'displays the error message', () => {
		const error = new Error( 'Connection timed out' );
		render( <InaccessibleJetpackNotice error={ error } /> );

		expect( screen.getByText( 'Connection timed out' ) ).toBeVisible();
	} );

	test( 'logs to Logstash on mount', () => {
		const error = new Error( 'Connection timed out' );
		render( <InaccessibleJetpackNotice error={ error } /> );

		expect( mockedLogToLogstash ).toHaveBeenCalledTimes( 1 );
		expect( mockedLogToLogstash ).toHaveBeenCalledWith( {
			feature: 'calypso_client',
			message: 'Connection timed out',
			tags: [ 'dashboard', 'jetpack-inaccessible' ],
			properties: {
				path: 'https://example.com/',
			},
		} );
	} );
} );
