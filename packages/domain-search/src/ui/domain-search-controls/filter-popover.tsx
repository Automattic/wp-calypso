import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	CheckboxControl,
	FormTokenField,
} from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

import './filter-popover.scss';

interface FilterState {
	exactSldMatchesOnly: boolean;
	tlds: string[];
}

interface DomainSearchControlsFilterPopoverProps {
	temporaryFilter: FilterState;
	setTemporaryFilter: ( filter: FilterState ) => void;
	availableTlds: string[];
	onClose: () => void;
	resetFilter: () => void;
}

export const DomainSearchControlsFilterPopover = ( {
	temporaryFilter,
	setTemporaryFilter,
	availableTlds,
	onClose,
	resetFilter,
}: DomainSearchControlsFilterPopoverProps ) => {
	const { __ } = useI18n();

	const setTldsInFilter = ( tlds: string[] ) => {
		setTemporaryFilter( {
			...temporaryFilter,
			tlds,
		} );
	};

	const addTldToFilter = ( tld: string ) => {
		setTemporaryFilter( {
			...temporaryFilter,
			tlds: [ ...temporaryFilter.tlds, tld ],
		} );
	};

	const setExactSldMatchesOnlyInFilter = ( exactSldMatchesOnly: boolean ) => {
		setTemporaryFilter( {
			...temporaryFilter,
			exactSldMatchesOnly,
		} );
	};

	const renderAvailableTld = ( tld: string ) => {
		return (
			<div
				className="domain-search-controls__filters-popover-available-tld"
				key={ tld }
				onClick={ () => {
					addTldToFilter( tld );
				} }
				onKeyDown={ ( event ) => {
					if ( event.key === 'Enter' ) {
						addTldToFilter( tld );
					}
				} }
				role="button"
				tabIndex={ 0 }
			>
				{ tld }
			</div>
		);
	};

	// Show list of available TLDs that weren't selected
	const renderAvailableTldsList = () => {
		return (
			<div className="domain-search-controls__filters-popover-available-tlds-container">
				{ availableTlds
					.filter( ( tld ) => ! temporaryFilter.tlds.includes( tld ) )
					.map( ( tld ) => renderAvailableTld( tld ) ) }
			</div>
		);
	};

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
					setTldsInFilter( values );
				} }
				placeholder={ __( 'Search for an ending' ) }
			/>
			{ renderAvailableTldsList() }
			<CheckboxControl
				label={ __( 'Show exact matches only' ) }
				checked={ temporaryFilter.exactSldMatchesOnly }
				onChange={ ( value ) => {
					setExactSldMatchesOnlyInFilter( value );
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
