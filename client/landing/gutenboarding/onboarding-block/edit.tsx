/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import React from 'react';

/**
 * Internal dependencies
 */
import { isFilledFormValue } from '../stores/onboard/types';
import { STORE_KEY } from '../stores/onboard';
import StepperWizard from './stepper-wizard';
import VerticalSelect from './vertical-select';
import SiteTypeSelect from './site-type-select';
import SiteTitle from './site-title';
import './style.scss';

export default function OnboardingEdit() {
	const { siteType, siteVertical } = useSelect( select => select( STORE_KEY ).getState() );

	return (
		<div className="onboarding-block__acquire-intent">
			<div className="onboarding-block__questions">
				<h2 className="onboarding-block__questions-heading">
					{ ! isFilledFormValue( siteType ) &&
						NO__( "Let's set up your website – it takes only a moment." ) }
				</h2>
				<StepperWizard>
					<SiteTypeSelect />
					{ isFilledFormValue( siteType ) && <VerticalSelect /> }
					{ isFilledFormValue( siteVertical ) && <SiteTitle /> }
				</StepperWizard>
			</div>
		</div>
	);
}
