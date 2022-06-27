/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import JetpackBenefitsSiteBackups from '../site-backups';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn().mockImplementation( () => {} ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
} ) );

jest.mock( 'calypso/state/selectors/get-rewind-backups' );

describe( 'Jetpack Benefits site backups card', () => {
	beforeEach( () => {
		getRewindBackups.mockReset();
	} );

	test( 'If backups are still loading, show a placeholder output', () => {
		getRewindBackups.mockReturnValue( null );
		render( <JetpackBenefitsSiteBackups /> );

		expect( screen.getByText( /loading backup data/i ) ).toBeInTheDocument();
	} );

	test( 'If no backups are found, show a no-backups output', () => {
		getRewindBackups.mockReturnValue( [] );
		render( <JetpackBenefitsSiteBackups /> );

		expect( screen.getByText( /will back up your site soon/i ) ).toBeInTheDocument();
	} );

	test( 'If last backup was an error, show an error message', () => {
		getRewindBackups.mockReturnValue( [ { status: 'error-will-retry' } ] );
		render( <JetpackBenefitsSiteBackups /> );

		expect( screen.getByText( /error/i ) ).toBeInTheDocument();
	} );

	test( 'If last backup is good, show default backup card output', () => {
		getRewindBackups.mockReturnValue( [ { status: 'finished' } ] );
		render( <JetpackBenefitsSiteBackups /> );

		expect( screen.getByText( /your latest site backup/i ) ).toBeInTheDocument();
	} );
} );
