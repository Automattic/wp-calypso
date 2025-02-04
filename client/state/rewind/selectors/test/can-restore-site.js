import { areJetpackCredentialsInvalid } from 'calypso/state/jetpack/credentials/selectors';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import getIsRestoreInProgress from 'calypso/state/selectors/get-is-restore-in-progress';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import canRestoreSite from '../can-restore-site';

// Mock selectors that are used in the tested selector
jest.mock( 'calypso/state/jetpack/credentials/selectors', () => ( {
	areJetpackCredentialsInvalid: jest.fn( () => false ),
} ) );
jest.mock( 'calypso/state/selectors/get-does-rewind-need-credentials', () =>
	jest.fn( () => false )
);
jest.mock( 'calypso/state/selectors/get-is-restore-in-progress', () => jest.fn( () => false ) );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => jest.fn( () => false ) );

describe( 'canRestoreSite', () => {
	const siteId = 12345;

	beforeEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should return false if site has no credentials', () => {
		getDoesRewindNeedCredentials.mockReturnValue( true );
		expect( canRestoreSite( {}, siteId ) ).toBe( false );
	} );

	it( 'should return false if there is a restore in progress', () => {
		getIsRestoreInProgress.mockReturnValue( true );
		expect( canRestoreSite( {}, siteId ) ).toBe( false );
	} );

	it( 'should return false if site is not atomic and credentials are invalid', () => {
		getDoesRewindNeedCredentials.mockReturnValue( true );
		isSiteAutomatedTransfer.mockReturnValue( false );
		areJetpackCredentialsInvalid.mockReturnValue( true );
		expect( canRestoreSite( {}, siteId ) ).toBe( false );
	} );

	it( 'should return true if site is atomic and credentials are invalid', () => {
		isSiteAutomatedTransfer.mockReturnValue( true );
		areJetpackCredentialsInvalid.mockReturnValue( true );
		expect( canRestoreSite( {}, siteId ) ).toBe( true );
	} );

	it( 'should return true if site is atomic and credentials are valid', () => {
		isSiteAutomatedTransfer.mockReturnValue( true );
		areJetpackCredentialsInvalid.mockReturnValue( false );
		expect( canRestoreSite( {}, siteId ) ).toBe( true );
	} );

	it( 'should return true if all conditions are false', () => {
		getDoesRewindNeedCredentials.mockReturnValue( false );
		getIsRestoreInProgress.mockReturnValue( false );
		isSiteAutomatedTransfer.mockReturnValue( false );
		areJetpackCredentialsInvalid.mockReturnValue( false );
		expect( canRestoreSite( {}, siteId ) ).toBe( true );
	} );
} );
