/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import WizardBar from 'components/wizard-bar';

const WizardBarExample = () => {
	return (
		<div>
			<WizardBar value={ 0 } />
			<WizardBar value={ 55 } total={ 100 } />
			<WizardBar value={ 100 } color="#1BABDA" />
		</div>
	);
};

WizardBarExample.displayName = 'WizardBar';

export default WizardBarExample;
