/** @format */

/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ProgressBar from 'components/progress-bar';

const StepNavigation = ( { backHref, nextHref, total, value, translate } ) => (
	<Card className="step-navigation">
		{ backHref && (
			<a href={ backHref }>
				<Gridicon icon="arrow-left" size={ 24 } className="step-navigation__left-arrow" />
				{ translate( 'Back' ) }
			</a>
		) }
		<ProgressBar value={ value } total={ total } />
		{ nextHref && (
			<a href={ nextHref }>
				{ translate( 'Next' ) }{' '}
				<Gridicon icon="arrow-right" size={ 24 } className="step-navigation__right-arrow" />
			</a>
		) }
	</Card>
);

StepNavigation.propTypes = {
	value: PropTypes.number,
	total: PropTypes.number,
	backHref: PropTypes.string,
	nextHref: PropTypes.string,
	translate: PropTypes.func,
};

export default localize( StepNavigation );
