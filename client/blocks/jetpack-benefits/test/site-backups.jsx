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
		const backupsReceived = null;
		getRewindBackups.mockReturnValue( backupsReceived );

		render( <JetpackBenefitsSiteBackups /> );
		const card = screen.getByTestId( 'loading-backups' );
		expect( card ).toBeInTheDocument();
	} );

	test( 'If no backups are found, show a no-backups output', () => {
		const backupsReceived = [];
		getRewindBackups.mockReturnValue( backupsReceived );

		render( <JetpackBenefitsSiteBackups /> );
		const card = screen.getByTestId( 'no-backups' );
		expect( card ).toBeInTheDocument();
	} );

	test( 'If last backup was an error, show an error message', () => {
		const backupsReceived = [ { status: 'error-will-retry' } ];
		getRewindBackups.mockReturnValue( backupsReceived );

		render( <JetpackBenefitsSiteBackups /> );
		const card = screen.getByTestId( 'recent-backup-error' );
		expect( card ).toBeInTheDocument();
	} );

	test( 'If last backup is good, show default backup card output', () => {
		const backupsReceived = [ { status: 'finished' } ];
		getRewindBackups.mockReturnValue( backupsReceived );

		render( <JetpackBenefitsSiteBackups /> );
		const card = screen.getByTestId( 'default-backup-output' );
		expect( card ).toBeInTheDocument();
	} );
} );
