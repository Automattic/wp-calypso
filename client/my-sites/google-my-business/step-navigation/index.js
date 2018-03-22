/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import ProgressBar from 'components/progress-bar';

const StepNavigation = ( { backHref, nextHref, total, value, translate } ) => (
	<CompactCard className="step-navigation">
		{ backHref && <Button href={ backHref }>{ translate( 'Back' ) }</Button> }
		<ProgressBar value={ value } total={ total } />
		{ value === total ? (
			<Button primary href={ nextHref }>
				{ translate( 'Done' ) }
			</Button>
		) : (
			<Button primary href={ nextHref }>
				{ translate( 'Next' ) }
			</Button>
		) }
	</CompactCard>
);

StepNavigation.propTypes = {
	value: PropTypes.number,
	total: PropTypes.number,
	backHref: PropTypes.string,
	nextHref: PropTypes.string,
	translate: PropTypes.func,
};

export default localize( StepNavigation );
