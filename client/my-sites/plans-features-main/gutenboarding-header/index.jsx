/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FormattedHeader from 'components/formatted-header';

/**
 * Style dependencies
 */
import './style.scss';

const GutenboardingHeader = ( { headerText, subHeaderText, onFreePlanSelect, translate } ) => {
	return (
		<div className="gutenboarding-header">
			<FormattedHeader
				headerText={ headerText }
				subHeaderText={ subHeaderText }
				isSecondary
				align="left"
			/>
			<Button className="gutenboarding-header__select-free-plan" onClick={ onFreePlanSelect }>
				{ translate( 'Start with a free plan' ) }
			</Button>
		</div>
	);
};

GutenboardingHeader.propTypes = {
	headerText: PropTypes.node,
	subHeaderText: PropTypes.node,
	onFreePlanSelect: PropTypes.func,
	translate: PropTypes.func,
};

export default localize( GutenboardingHeader );
