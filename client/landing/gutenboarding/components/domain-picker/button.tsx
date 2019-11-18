/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { __ as NO__ } from '@wordpress/i18n';
import { Button, Popover } from '@wordpress/components';

/**
 * Internal dependencies
 */
import DomainPicker from './list';

const DomainPickerButton: FunctionComponent = () => {
	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState(
		true /* @TODO: should be `false` by default, true for dev */
	);

	return (
		<Button onClick={ () => setDomainPopoverVisibility( s => ! s ) }>
			{ NO__( 'Pick a domain' ) }
			{ isDomainPopoverVisible && (
				<Popover
					/* Prevent interaction in the domain picker from affecting the popover */
					onClick={ e => e.stopPropagation() }
					onKeyDown={ e => e.stopPropagation() }
				>
					<DomainPicker />
				</Popover>
			) }
		</Button>
	);
};

export default DomainPickerButton;
