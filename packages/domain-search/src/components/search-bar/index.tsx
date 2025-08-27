import {
	Button,
	Dropdown,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	CheckboxControl,
	FormTokenField,
} from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';

import './style.scss';

const DELAY_TIMEOUT = 300;

const emptyFilter = {
	exactSldMatchesOnly: false,
	tlds: [],
};

export const SearchBar = () => {
	const { __ } = useI18n();
	const { query, setQuery } = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( query );
	const [ filter, setFilter ] = useState( emptyFilter );
	// This is the filter that the user is currently selecting. It is only applied when the popover is closed
	const [ temporaryFilter, setTemporaryFilter ] = useState( emptyFilter );
	// TODO: Hardcoded for testing, should get those from the https://public-api.wordpress.com/rest/v1.1/domains/suggestions/tlds endpoint
	const availableTlds = [ 'com', 'net', 'org', 'blog', 'dev', 'io', 'co', 'co.uk', 'com.br', 'de' ];

	useEffect( () => {
		const timeout = setTimeout( () => {
			setQuery( localQuery );
		}, DELAY_TIMEOUT );

		return () => clearTimeout( timeout );
	}, [ localQuery, setQuery ] );

	const getFiltercounts = useCallback( () => {
		return filter.tlds.length + ( filter.exactSldMatchesOnly ? 1 : 0 );
	}, [ filter ] );

	const resetFilter = useCallback( () => {
		setFilter( emptyFilter );
		setTemporaryFilter( emptyFilter );
	}, [] );

	const renderAvailableTld = ( tld: string ) => {
		return (
			<div
				className="domain-search-controls__filters-popover-available-tld"
				key={ tld }
				onClick={ () => {
					setTemporaryFilter( {
						tlds: [ ...temporaryFilter.tlds, tld ],
						exactSldMatchesOnly: temporaryFilter.exactSldMatchesOnly,
					} );
				} }
			>
				{ tld }
			</div>
		);
	};

	// Show list of available TLDs that weren't selected
	const renderAvailableTlds = () => {
		return (
			<div className="domain-search-controls__filters-popover-available-tlds-container">
				{ availableTlds
					.filter( ( tld ) => ! temporaryFilter.tlds.includes( tld ) )
					.map( ( tld ) => renderAvailableTld( tld ) ) }
			</div>
		);
	};

	const renderPopover = ( onClose: () => void ) => {
		return (
			<VStack className="domain-search-controls__filters-popover" spacing={ 4 }>
				<FormTokenField
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					__experimentalShowHowTo={ false }
					__experimentalValidateInput={ ( value ) => {
						// Only add TLD to current selection if it exists
						return availableTlds.includes( value );
					} }
					value={ temporaryFilter.tlds }
					suggestions={ availableTlds }
					onChange={ ( values ) => {
						setTemporaryFilter( {
							tlds: values,
							exactSldMatchesOnly: temporaryFilter.exactSldMatchesOnly,
						} );
					} }
					placeholder={ __( 'Search for an ending' ) }
				/>
				{ renderAvailableTlds() }
				<CheckboxControl
					label={ __( 'Show exact matches only' ) }
					checked={ temporaryFilter.exactSldMatchesOnly }
					onChange={ ( value ) => {
						setTemporaryFilter( { tlds: temporaryFilter.tlds, exactSldMatchesOnly: value } );
					} }
				/>
				<HStack spacing={ 4 } className="domain-search-controls__filters-popover-buttons">
					<Button
						variant="secondary"
						onClick={ () => {
							onClose();
							resetFilter();
						} }
					>
						{ __( 'Clear' ) }
					</Button>
					<Button variant="primary" onClick={ onClose }>
						{ __( 'Apply' ) }
					</Button>
				</HStack>
			</VStack>
		);
	};

	return (
		<HStack spacing={ 4 }>
			<DomainSearchControls.Input
				value={ localQuery }
				onChange={ ( value ) => {
					const trimmedValue = value.trim();

					if ( trimmedValue ) {
						setLocalQuery( trimmedValue );
					}
				} }
				label={ __( 'Search for a domain' ) }
				// eslint-disable-next-line jsx-a11y/no-autofocus
				autoFocus={ false }
				minLength={ 1 }
				maxLength={ 253 }
				dir="ltr"
				onBlur={ () => {} }
				onKeyDown={ () => {} }
			/>
			<Dropdown
				showArrow={ false }
				popoverProps={ { placement: 'bottom-end', offset: 10, noArrow: false } }
				renderToggle={ ( { onToggle } ) => {
					return (
						<DomainSearchControls.FilterButton count={ getFiltercounts() } onClick={ onToggle } />
					);
				} }
				renderContent={ ( { onClose } ) => {
					return renderPopover( onClose );
				} }
				onClose={ () => {
					setFilter( temporaryFilter );
				} }
			/>
		</HStack>
	);
};
