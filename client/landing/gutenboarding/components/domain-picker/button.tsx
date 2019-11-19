/**
 * External dependencies
 */
import React, { FunctionComponent, useState, useRef } from 'react';
import { Button, Popover, Dashicon } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { head, partition } from 'lodash';
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
	const popoverAnchor = useRef< HTMLElement >();

	// User can search for a domain
	const [ domainSearch, setDomainSearch ] = useState( '' );

	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState(
		true /* @TODO: should be `false` by default, true for dev */
	);

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

	const [ freeDomainSuggestions, paidDomainSuggestions ] = partition( suggestions, 'is_free' );

	return (
		<>
			<Button
				className={ classnames( 'domain-picker__button', { 'is-open': isDomainPopoverVisible } ) }
				aria-pressed={ isDomainPopoverVisible }
				onClick={ () => setDomainPopoverVisibility( s => ! s ) }
			>
				{ /* This empty span gives us a good place to anchor our popover */ }
				<span ref={ popoverAnchor } />
				{ head( freeDomainSuggestions )?.domain_name ?? '\u00a0' }
				<Dashicon icon="arrow-down-alt2" />
			</Button>
			{ isDomainPopoverVisible && (
				<Popover anchorRect={ popoverAnchor.current?.getBoundingClientRect() }>
					<DomainPicker
						domainSearch={ domainSearch }
						setDomainSearch={ setDomainSearch }
						suggestions={ paidDomainSuggestions }
					/>
				</Popover>
			) }
		</>
	);
};

export default DomainPickerButton;
