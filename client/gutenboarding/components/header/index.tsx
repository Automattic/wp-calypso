/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import React from 'react';

/**
 * Internal dependencies
 */
import './style.scss';

export function Header() {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ __( 'Top bar' ) }
			tabIndex="-1"
		>
			<div className="gutenboarding__header-actions">
				<Button isPrimary isLarge>
					{ __( 'Continue' ) }
				</Button>
			</div>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
