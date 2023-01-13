/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import JetpackBenefitsSiteBackups from '../site-backups';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn().mockImplementation( () => {} ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
} ) );

jest.mock( 'calypso/state/selectors/get-rewind-backups' );
jest.mock( 'calypso/state/sites/selectors' );

describe( 'Jetpack Benefits site backups card', () => {
	beforeEach( () => {
		getRewindBackups.mockReset();
		getSiteSlug.mockReset();
	} );

	test( 'If backup license is not assigned to a site, show a license needs activation message', () => {
		getSiteSlug.mockReturnValue( undefined );

		render( <JetpackBenefitsSiteBackups /> );

		expect( screen.getByText( /License key awaiting activation/i ) ).toBeInTheDocument();
	} );

	test( 'If backups are still loading, show a placeholder output', () => {
		getRewindBackups.mockReturnValue( null );
		getSiteSlug.mockReturnValue( 'test-site' );

		render( <JetpackBenefitsSiteBackups /> );

		expect( screen.getByText( /loading backup data/i ) ).toBeInTheDocument();
	} );

	test( 'If no backups are found, show a no-backups output', () => {
		getRewindBackups.mockReturnValue( [] );
		getSiteSlug.mockReturnValue( 'test-site' );

		render( <JetpackBenefitsSiteBackups /> );

		expect( screen.getByText( /will back up your site soon/i ) ).toBeInTheDocument();
	} );

	test( 'If last backup was an error, show an error message', () => {
		getRewindBackups.mockReturnValue( [ { status: 'error-will-retry' } ] );
		getSiteSlug.mockReturnValue( 'test-site' );

		render( <JetpackBenefitsSiteBackups /> );

		expect( screen.getByText( /error/i ) ).toBeInTheDocument();
	} );

	test( 'If last backup is good, show default backup card output', () => {
		getRewindBackups.mockReturnValue( [ { status: 'finished' } ] );
		getSiteSlug.mockReturnValue( 'test-site' );

		render( <JetpackBenefitsSiteBackups /> );

		expect( screen.getByText( /your latest site backup/i ) ).toBeInTheDocument();
	} );
} );
