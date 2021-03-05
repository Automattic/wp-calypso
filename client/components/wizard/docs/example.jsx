/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Wizard from '../index';

const First = () => <div style={ { textAlign: 'center' } }>This is the first step.</div>;
const Second = () => <div style={ { textAlign: 'center' } }>This is the second step.</div>;
const Third = () => <div style={ { textAlign: 'center' } }>This is the third step.</div>;
const STEPS = {
	FIRST: 'first',
	SECOND: 'second',
	THIRD: 'third',
};
const steps = [ STEPS.FIRST, STEPS.SECOND, STEPS.THIRD ];
const components = {
	[ STEPS.FIRST ]: <First />,
	[ STEPS.SECOND ]: <Second />,
	[ STEPS.THIRD ]: <Third />,
};

const WizardExample = ( { stepName = steps[ 0 ] } ) => (
	<div>
		<Wizard
			basePath="/devdocs/design/wizard"
			components={ components }
			steps={ steps }
			stepName={ stepName }
		/>
	</div>
);

WizardExample.displayName = 'Wizard';

export default WizardExample;
