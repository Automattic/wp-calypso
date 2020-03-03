/*
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import React, { FunctionComponent } from 'react';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';
import StepperWizard from './stepper-wizard';
import VerticalSelect from './vertical-select';
import SiteTitle from './site-title';
import { Step, usePath } from '../path';
import './animatedPlaceholder.scss';

const AnimatedPlaceholder: FunctionComponent = () => {
	const { __: NO__ } = useI18n();
	const suggestions = [
		NO__( 'football' ),
		NO__( 'shopping' ),
		NO__( 'cars' ),
		NO__( 'design' ),
		NO__( 'travel' ),
	];

	return (
		<div className="animated-input-placeholder">
			<div className="animated-input-placeholder__content">
				{ suggestions.map( ( suggestion, index ) => (
					<span className="animated-input-placeholder__suggestion" key={ index }>
						{ suggestion }
					</span>
				) ) }
			</div>
		</div>
	);
};

export default AnimatedPlaceholder;
