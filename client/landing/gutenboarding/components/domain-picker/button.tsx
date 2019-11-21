/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { __ as NO__ } from '@wordpress/i18n';
import { Button, Popover, Dashicon } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import classnames from 'classnames';
import { useDebounce } from 'use-debounce';

/**
 * Internal dependencies
 */
import DomainPicker from './list';
import { STORE_KEY as DOMAIN_STORE } from '../../stores/domain-suggestions';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { isFilledFormValue } from '../../stores/onboard/types';
import { selectorDebounce } from '../../constants';

/**
 * Style dependencies
 */
import './style.scss';

const DomainPickerButton: FunctionComponent = ( { children } ) => {
	// User can search for a domain
	const [ domainSearch, setDomainSearch ] = useState( '' );

	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState( false );

	// Without user search, we can provide recommendations based on title + vertical
	const { siteTitle, siteVertical } = useSelect( select => select( ONBOARD_STORE ).getState() );

	const [ search ] = useDebounce(
		// Use trimmed domainSearch if non-empty
		domainSearch.trim() ||
			// Otherwise use a filled form value
			( isFilledFormValue( siteTitle ) && siteTitle ) ||
			// Otherwise use empty string
			'',
		selectorDebounce
	);
	const suggestions = useSelect(
		select => {
			if ( search ) {
				return select( DOMAIN_STORE ).getDomainSuggestions(
					search,
					isFilledFormValue( siteVertical ) ? { vertical: siteVertical.id } : undefined
				);
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
				{ children }
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
