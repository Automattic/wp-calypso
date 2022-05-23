/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import isRequestingJetpackScan from 'calypso/state/selectors/is-requesting-jetpack-scan';
import JetpackBenefitsScanHistory from '../scan-history';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn().mockImplementation( () => {} ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
} ) );

jest.mock( 'calypso/state/selectors/get-site-scan-state' );
jest.mock( 'calypso/state/selectors/is-requesting-jetpack-scan' );
jest.mock( 'calypso/state/selectors/is-requesting-jetpack-scan-threat-counts' );
jest.mock( 'calypso/state/selectors/get-site-scan-progress' );

describe( 'Scan History Jetpack Benefit Block', () => {
	beforeEach( () => {
		getSiteScanState.mockReset();
		isRequestingJetpackScan.mockReset();
	} );

	test( 'When the scan state is actively scanning, show a scanning message', () => {
		const scanState = { state: 'scanning' };
		getSiteScanState.mockReturnValue( scanState );

		render( <JetpackBenefitsScanHistory /> );
		const card = screen.getByTestId( 'scanning' );

		expect( card ).toBeInTheDocument();
	} );

	test( 'When the scan state is provisioning, show a preparing message', () => {
		const scanState = { state: 'provisioning' };
		getSiteScanState.mockReturnValue( scanState );

		render( <JetpackBenefitsScanHistory /> );
		const card = screen.getByTestId( 'provisioning' );

		expect( card ).toBeInTheDocument();
	} );

	test( 'When the scan state is still loading, show a loading placeholder', () => {
		getSiteScanState.mockReturnValue( null );
		isRequestingJetpackScan.mockReturnValue( true );

		render( <JetpackBenefitsScanHistory /> );
		const card = screen.getByTestId( 'loading' );

		expect( card ).toBeInTheDocument();
	} );

	test( 'When the scan state is not present and not loading, show an error', () => {
		getSiteScanState.mockReturnValue( null );
		isRequestingJetpackScan.mockReturnValue( false );

		render( <JetpackBenefitsScanHistory /> );
		const card = screen.getByTestId( 'error' );

		expect( card ).toBeInTheDocument();
	} );

	test( 'When the scan state is idle, but there is not a recent scan, indicate that a scan is scheduled', () => {
		const scanState = { state: 'idle' };
		getSiteScanState.mockReturnValue( scanState );
		isRequestingJetpackScan.mockReturnValue( false );

		render( <JetpackBenefitsScanHistory /> );
		const card = screen.getByTestId( 'scheduled' );

		expect( card ).toBeInTheDocument();
	} );

	test( 'If product is standalone scan, the expanded standalone card is rendered', () => {
		getSiteScanState.mockReturnValue( { state: 'idle', mostRecent: { timestamp: '' } } );
		isRequestingJetpackScan.mockReturnValue( false );

		const { container } = render( <JetpackBenefitsScanHistory isStandalone={ true } /> );
		expect( container ).toMatchSnapshot();
	} );
} );
