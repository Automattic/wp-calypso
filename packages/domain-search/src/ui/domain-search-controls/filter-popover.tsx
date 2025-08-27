import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	CheckboxControl,
	FormTokenField,
} from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useI18n } from '@wordpress/react-i18n';
import { FilterState } from '../../components/search-bar/types';

import './filter-popover.scss';

type Props = {
	addTldToFilter: ( tld: string ) => void;
	setExactSldMatchesOnlyInFilter: ( exactSldMatchesOnly: boolean ) => void;
	temporaryFilter: FilterState;
	availableTlds: string[];
	onClear: () => void;
	onClose: () => void;
	validateTld: ( tld: string ) => boolean;
	handleTldsChange: ( tokens: ( string | TokenItem )[] ) => void;
};

export const DomainSearchControlsFilterPopover = ( {
	addTldToFilter,
	setExactSldMatchesOnlyInFilter,
	temporaryFilter,
	availableTlds,
	onClear,
	onClose,
	validateTld,
	handleTldsChange,
}: Props ) => {
	const { __ } = useI18n();

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
				__experimentalValidateInput={ validateTld }
				value={ temporaryFilter.tlds }
				suggestions={ availableTlds }
				onChange={ handleTldsChange }
				placeholder={ __( 'Search for an ending' ) }
			/>
			{ renderAvailableTldsList() }
			<CheckboxControl
				label={ __( 'Show exact matches only' ) }
				checked={ temporaryFilter.exactSldMatchesOnly }
				onChange={ setExactSldMatchesOnlyInFilter }
			/>
			<HStack spacing={ 4 } className="domain-search-controls__filters-popover-buttons">
				<Button variant="secondary" onClick={ onClear }>
					{ __( 'Clear' ) }
				</Button>
				<Button variant="primary" onClick={ onClose }>
					{ __( 'Apply' ) }
				</Button>
			</HStack>
		</VStack>
	);
};
