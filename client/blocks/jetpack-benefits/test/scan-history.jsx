/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { shallow } from 'enzyme';
import JetpackBenefitsScanHistory from '../scan-history';
import { JetpackBenefitsStandaloneCard } from 'calypso/blocks/jetpack-benefits/standalone-benefit-card';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import isRequestingJetpackScan from 'calypso/state/selectors/is-requesting-jetpack-scan';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';

/**
 * Mock dependencies
 */
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
	const getBenefitsCard = () => {
		const element = shallow( <JetpackBenefitsScanHistory /> );
		return element.find( 'JetpackBenefitsScanHistory' ).dive().find( JetpackBenefitsCard );
	};

	beforeEach( () => {
		getSiteScanState.mockReset();
		isRequestingJetpackScan.mockReset();
	} );

	test( 'When the scan state is actively scanning, show a scanning message', () => {
		const scanState = { state: 'scanning' };
		getSiteScanState.mockReturnValue( scanState );
		expect( getBenefitsCard().props() ).toHaveProperty( 'jestMarker', 'scanning' );
	} );

	test( 'When the scan state is provisioning, show a preparing message', () => {
		const scanState = { state: 'provisioning' };
		getSiteScanState.mockReturnValue( scanState );
		expect( getBenefitsCard().props() ).toHaveProperty( 'jestMarker', 'provisioning' );
	} );

	test( 'When the scan state is still loading, show a loading placeholder', () => {
		getSiteScanState.mockReturnValue( null );
		isRequestingJetpackScan.mockReturnValue( true );
		expect( getBenefitsCard().props() ).toHaveProperty( 'jestMarker', 'loading' );
	} );

	test( 'When the scan state is not present and not loading, show an error', () => {
		getSiteScanState.mockReturnValue( null );
		isRequestingJetpackScan.mockReturnValue( false );
		expect( getBenefitsCard().props() ).toHaveProperty( 'jestMarker', 'error' );
	} );

	test( 'If product is standalone scan, the expanded standalone card is rendered', () => {
		getSiteScanState.mockReturnValue( { state: 'idle', mostRecent: { timestamp: '' } } );
		isRequestingJetpackScan.mockReturnValue( false );

		const standaloneCard = shallow( <JetpackBenefitsScanHistory isStandalone={ true } /> )
			.find( 'JetpackBenefitsScanHistory' )
			.dive()
			.find( JetpackBenefitsStandaloneCard );

		expect( standaloneCard ).toHaveLength( 1 );
	} );
} );
