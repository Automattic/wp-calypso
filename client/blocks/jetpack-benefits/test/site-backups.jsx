import { shallow } from 'enzyme';
import getRewindBackups from 'calypso/state/selectors/get-rewind-backups';
import JetpackBenefitsSiteBackups from '../site-backups';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn().mockImplementation( () => {} ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
} ) );

jest.mock( 'calypso/state/selectors/get-rewind-backups' );

describe( 'Jetpack Benefits site backups card', () => {
	const getBenefitsCard = () => {
		const element = shallow( <JetpackBenefitsSiteBackups /> );
		return element.find( 'JetpackBenefitsSiteBackups' ).dive().find( 'JetpackBenefitsCard' );
	};

	beforeEach( () => {
		getRewindBackups.mockReset();
	} );

	test( 'If backups are still loading, show a placeholder output', () => {
		const backupsReceived = null;
		getRewindBackups.mockReturnValue( backupsReceived );
		expect( getBenefitsCard().props() ).toHaveProperty( 'jestMarker', 'loading-backups' );
	} );

	test( 'If no backups are found, show a no-backups output', () => {
		const backupsReceived = [];
		getRewindBackups.mockReturnValue( backupsReceived );
		expect( getBenefitsCard().props() ).toHaveProperty( 'jestMarker', 'no-backups' );
	} );

	test( 'If last backup was an error, show an error message', () => {
		const backupsReceived = [ { status: 'error-will-retry' } ];
		getRewindBackups.mockReturnValue( backupsReceived );
		expect( getBenefitsCard().props() ).toHaveProperty( 'jestMarker', 'recent-backup-error' );
	} );

	test( 'If last backup is good, show default backup card output', () => {
		const backupsReceived = [ { status: 'finished' } ];
		getRewindBackups.mockReturnValue( backupsReceived );
		expect( getBenefitsCard().props() ).toHaveProperty( 'jestMarker', 'default-backup-output' );
	} );
} );
