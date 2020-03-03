/**
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
import './colors.scss';
import './style.scss';
import Link from '../components/link';

const AcquireIntent: FunctionComponent = () => {
	const { __: NO__ } = useI18n();
	const { siteVertical, siteTitle } = useSelect( select => select( STORE_KEY ).getState() );
	const makePath = usePath();
	return (
		<div className="onboarding-block__acquire-intent" data-vertical={ siteVertical?.label }>
			<div className="onboarding-block__questions">
				<StepperWizard
					stepComponents={ [ VerticalSelect, ( siteVertical || siteTitle ) && SiteTitle ] }
				/>
				{ siteVertical && (
					<div className="onboarding-block__footer">
						<Link
							to={ makePath( Step.DesignSelection ) }
							className="onboarding-block__question-skip"
							isLink
						>
							{ /* @TODO: add transitions and correct action */ }
							{ siteTitle ? NO__( 'Choose a design' ) : NO__( "Don't know yet" ) }
						</Link>
					</div>
				) }
			</div>
		</div>
	);
};

export default AcquireIntent;
