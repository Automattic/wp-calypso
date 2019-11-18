/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { __ as NO__, sprintf } from '@wordpress/i18n';
import { Button, Popover } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import DomainPicker from './list';
import { STORE_KEY as DOMAIN_STORE } from '../../stores/domain-suggestions';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { isFilledFormValue } from '../../stores/onboard/types';

const DomainPickerButton: FunctionComponent = () => {
	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState(
		true /* @TODO: should be `false` by default, true for dev */
	);

	// Without user search, we can provide recommendations based on title + vertical
	const { siteTitle, siteVertical } = useSelect( select => select( ONBOARD_STORE ).getState() );

	const suggestions = useSelect(
		select => {
			if ( isFilledFormValue( siteTitle ) ) {
				return select( DOMAIN_STORE ).getDomainSuggestions( siteTitle, {
					include_wordpressdotcom: true,
					...( isFilledFormValue( siteVertical ) && { vertical: siteVertical.id } ),
				} );
			}
		},
		[ siteTitle, siteVertical ]
	);

	const domainName = suggestions?.[ 1 ]?.domain_name;

	return (
		<Button onClick={ () => setDomainPopoverVisibility( s => ! s ) }>
			{ domainName ? sprintf( NO__( '%s is available' ), domainName ) : null }
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
