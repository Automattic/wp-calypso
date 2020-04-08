/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';

/**
 * Style dependencies
 */
import './style.scss';

const GutenboardingHeader = ( { translate, onFreePlanSelect } ) => {
	return (
		<div className="gutenboarding-header">
			<FormattedHeader
				headerText={ translate( 'Choose a plan' ) }
				subHeaderText={ translate(
					'Pick a plan that’s right for you. Switch plans as your needs change. {{br/}} There’s no risk, you can cancel for a full refund within 30 days.',
					{
						components: { br: <br /> },
						comment:
							'Subheader of the plans page where users land from onboarding after they picked a paid domain',
					}
				) }
				compactOnMobile
				isSecondary
			/>
			<button className="gutenboarding-header__select-free-plan" onClick={ onFreePlanSelect }>
				{ translate( 'Start with a free plan' ) }
			</button>
		</div>
	);
};

export default localize( GutenboardingHeader );
