/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import noop from 'lodash/noop';
import React, { PropTypes } from 'react';
import reduce from 'lodash/reduce';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';
import {
	isJetpack,
	JETPACK_PLANS,
	plansList,
	WPCOM_PLANS
} from 'lib/plans/constants';

function getLongestDescription( planName ) {
	if ( ! planName ) {
		return null;
	}
	return reduce(
		isJetpack( planName ) ? JETPACK_PLANS : WPCOM_PLANS,
		( longestDescription, plan ) => {
			const currentDescription = plansList[ plan ].getDescription();
			return currentDescription.length > longestDescription.length
				? currentDescription : longestDescription;
		},
		''
	);
}

const PlanFeaturesFooter = ( {
	available = true,
	current = false,
	description,
	onUpgradeClick = noop,
	planType,
	translate,
} ) => {

	let upgradeButton;
	
	if ( current ) {
		upgradeButton = (
			<Button className="plan-features__footer-button is-current" disabled>
				<Gridicon size={ 18 } icon="checkmark" />
				{ translate( 'Your plan' ) }
			</Button>
		);
	} else if ( available ) {
		upgradeButton = (
			<Button className="plan-features__footer-button" onClick={ onUpgradeClick } primary>
				{ translate( 'Upgrade' ) }
			</Button>
		);
	}

	const classes = classNames( 'plan-features__footer', { 'has-description': !! description } );
	const longestDescription = getLongestDescription( planType );
	return (
		<footer className={ classes }>
			{ description &&
				<p className="plan-features__footer-desc">
					<span className="plan-features__footer-desc-text">
						{ description }
					</span>
					<span className="plan-features__footer-desc-longest">
						{ longestDescription }
					</span>
				</p>
			}
			<div className="plan-features__footer-buttons">
				{ upgradeButton }
			</div>
		</footer>
	);
};

PlanFeaturesFooter.propTypes = {
	current: PropTypes.bool,
	available: PropTypes.bool,
	description: PropTypes.string,
	onUpgradeClick: PropTypes.func,
	planType: PropTypes.string
};

export default localize( PlanFeaturesFooter );
