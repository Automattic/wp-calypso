/**
 * External dependencies
 */
import React from 'react';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import UpgradeNudge from './upgrade-nudge';

const wrapPremiumBlocks = WrappedComponent => {
	return class extends React.Component {
		render() {
			// Wraps the input component in a container, without mutating it. Good!
			return (
				<div className="premium-blocks__wrapper">
					<UpgradeNudge />
					<div className="premium-blocks__disabled">
						<WrappedComponent { ...this.props } />
					</div>
				</div>
			);
		}
	};
};

const premiumBlocks = ( settings, name ) => {
	if ( name === 'jetpack/simple-payments' ) {
		return {
			...settings,
			edit: wrapPremiumBlocks( settings.edit ),
		};
	}

	return settings;
};

addFilter( 'blocks.registerBlockType', 'jetpack', premiumBlocks );
