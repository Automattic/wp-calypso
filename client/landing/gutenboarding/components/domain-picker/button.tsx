/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { Button, Popover, Dashicon } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import DomainPicker from './list';
import { STORE_KEY as DOMAIN_STORE } from '../../stores/domain-suggestions';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { isFilledFormValue } from '../../stores/onboard/types';
import { useDebounce } from 'use-debounce';

/**
 * Style dependencies
 */
import './style.scss';

const DomainPickerButton: FunctionComponent = () => {
	// User can search for a domain
	const [ domainSearch, setDomainSearch ] = useState( '' );

	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState( false );

	// Without user search, we can provide recommendations based on title + vertical
	const { siteTitle, siteVertical } = useSelect( select => select( ONBOARD_STORE ).getState() );

	/**
	 * Debounce our input + HTTP dependent select changes
	 *
	 * Rapidly changing input generates excessive HTTP requests.
	 * It also leads to jarring UI changes.
	 *
	 * @see https://stackoverflow.com/a/44755058/1432801
	 */
	const inputDebounce = 300;
	const [ search ] = useDebounce(
		// Use trimmed domainSearch if non-empty
		domainSearch.trim() ||
			// Otherwise use a filled form value
			( isFilledFormValue( siteTitle ) && siteTitle ) ||
			// Otherwise use empty string
			'',
		inputDebounce
	);
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

	return (
		<>
			<Button
				aria-expanded={ isDomainPopoverVisible }
				aria-haspopup="menu"
				aria-pressed={ isDomainPopoverVisible }
				className={ classnames( 'domain-picker__button', { 'is-open': isDomainPopoverVisible } ) }
				onClick={ () => setDomainPopoverVisibility( s => ! s ) }
			>
				{ NO__( 'Choose a domain' ) }
				<Dashicon icon="arrow-down-alt2" />
			</Button>
			{ isDomainPopoverVisible && (
				<Popover>
					<DomainPicker
						domainSearch={ domainSearch }
						setDomainSearch={ setDomainSearch }
						suggestions={ suggestions }
					/>
				</Popover>
			) }
		</>
	);
};

export default DomainPickerButton;
