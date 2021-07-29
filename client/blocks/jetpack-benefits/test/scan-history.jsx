/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { shallow } from 'enzyme';
import { JetpackBenefitsScanHistory } from '../scan-history';
import { JetpackBenefitsStandaloneCard } from 'calypso/blocks/jetpack-benefits/standalone-benefit-card';

describe( 'Scan History Jetpack Benefit Block', () => {
	// swap relevant methods with a mocked ones
	JetpackBenefitsScanHistory.prototype.renderScanningNow = jest.fn();
	JetpackBenefitsScanHistory.prototype.renderScanningProvisioning = jest.fn();
	JetpackBenefitsScanHistory.prototype.renderScanLoading = jest.fn();
	JetpackBenefitsScanHistory.prototype.renderScanError = jest.fn();

	test( 'When the scan state is actively scanning, show a scanning message', () => {
		shallow( <JetpackBenefitsScanHistory siteScanState={ { state: 'scanning' } } /> );
		expect( JetpackBenefitsScanHistory.prototype.renderScanningNow ).toHaveBeenCalled();
	} );

	test( 'When the scan state is provisioning, show a preparing message', () => {
		shallow( <JetpackBenefitsScanHistory siteScanState={ { state: 'provisioning' } } /> );
		expect( JetpackBenefitsScanHistory.prototype.renderScanningProvisioning ).toHaveBeenCalled();
	} );

	test( 'When the scan state is still loading, show a loading placeholder', () => {
		shallow( <JetpackBenefitsScanHistory siteScanState={ {} } requestingScanState={ true } /> );
		expect( JetpackBenefitsScanHistory.prototype.renderScanLoading ).toHaveBeenCalled();
	} );

	test( 'When the scan state is not present and not loading, show an error', () => {
		shallow( <JetpackBenefitsScanHistory siteScanState={ {} } requestingScanState={ false } /> );
		expect( JetpackBenefitsScanHistory.prototype.renderScanError ).toHaveBeenCalled();
	} );

	test( 'If product is standalone scan, the expanded standalone card is rendered', () => {
		const component = shallow(
			<JetpackBenefitsScanHistory
				siteScanState={ {
					state: 'idle',
					mostRecent: {
						timestamp: '',
					},
				} }
				requestingScanState={ false }
				isStandalone={ true }
			/>
		);

		expect( component.find( JetpackBenefitsStandaloneCard ) ).toHaveLength( 1 );
	} );
} );
