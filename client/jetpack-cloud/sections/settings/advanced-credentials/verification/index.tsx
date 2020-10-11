/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import { random } from 'lodash';

/**
 * Internal dependencies
 */
import { useInterval, EVERY_SECOND } from 'lib/interval';

const Verification: FunctionComponent = () => {
	const translate = useTranslate();

	const steps = [
		translate( 'Preflight check' ),
		translate( 'Login successful' ),
		translate( 'Locating WordPress installation' ),
		translate( 'File permission check complete' ),
		translate( 'Secure connection established' ),
	];

	const [ currentStep, setCurrentStep ] = useState( 0 );

	useInterval(
		() => {
			setCurrentStep( currentStep + 1 );
		},
		currentStep < steps.length - 1 ? random( EVERY_SECOND, EVERY_SECOND * 3 ) : null
	);

	return (
		<div>
			<h4>Verification</h4>
			<ul>
				{ steps.map( ( step, index ) => {
					if ( index < currentStep ) {
						return <li key={ index }>{ step }</li>;
					} else if ( index === currentStep ) {
						return <li key={ index }>{ step }</li>;
					}
					return null;
				} ) }
			</ul>
		</div>
	);
};

export default Verification;
