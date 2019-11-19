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

import './style.scss';

const DomainPickerButton: FunctionComponent = () => {
	// // User can search for a domain
	const [ domainSearch, setDomainSearch ] = useState( '' );

	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState(
		true /* @TODO: should be `false` by default, true for dev */
	);

	// Without user search, we can provide recommendations based on title + vertical
	const { siteTitle, siteVertical } = useSelect( select => select( ONBOARD_STORE ).getState() );

	let search = domainSearch.trim();
	if ( ! search && isFilledFormValue( siteTitle ) ) {
		search = siteTitle;
	}

	const suggestions = useSelect(
		select => {
			if ( search ) {
				return select( DOMAIN_STORE ).getDomainSuggestions( search, {
					include_wordpressdotcom: true,
					...( isFilledFormValue( siteVertical ) && { vertical: siteVertical.id } ),
				} );
			}
		},
		[ search, siteVertical ]
	);

	// Free .wordpress.com subdomain at index 0,
	// Best premium domain match at index 1.
	const domainName = suggestions?.[ 1 ]?.domain_name;

	return (
		<Button
			className="domain-picker__button"
			onClick={ () => setDomainPopoverVisibility( s => ! s ) }
		>
			<div className="domain-picker__site-title">
				{ siteTitle ? siteTitle : NO__( 'Create your site' ) }
			</div>
			<div>{ domainName ? sprintf( NO__( '%s is available' ), domainName ) : null }</div>
			{ isDomainPopoverVisible && (
				<Popover
					/* Prevent interaction in the domain picker from affecting the popover */
					onClick={ e => e.stopPropagation() }
					onKeyDown={ e => e.stopPropagation() }
				>
					<DomainPicker
						domainSearch={ domainSearch }
						setDomainSearch={ setDomainSearch }
						suggestions={ suggestions }
					/>
				</Popover>
			) }
		</Button>
	);
};

export default DomainPickerButton;
