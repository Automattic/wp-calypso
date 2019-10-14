/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, NavigableMenu } from '@wordpress/components';
import React from 'react';

/**
 * Internal dependencies
 */
import Inserter from './inserter';
import './style.scss';

export function Header() {
	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ __( 'Top bar' ) }
			tabIndex="-1"
		>
			<NavigableMenu>
				<Inserter.Slot />
			</NavigableMenu>
			<div className="gutenboarding__header-actions">
				<Button isPrimary isLarge>
					{ __( 'Continue' ) }
				</Button>
			</div>
		</div>
	);
}
