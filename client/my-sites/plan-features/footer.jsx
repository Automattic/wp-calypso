/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import noop from 'lodash/noop';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';

const PlanFeaturesFooter = ( {
	available = true,
	current = false,
	description,
	onUpgradeClick = noop,
	translate
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
	return (
		<footer className={ classes }>
			{ description &&
				<p className="plan-features__footer-desc">
					<span className="plan-features__footer-desc-text">
						{ description }
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
};

export default localize( PlanFeaturesFooter );
