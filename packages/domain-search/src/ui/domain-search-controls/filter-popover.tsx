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
import { FilterPopoverLabel } from './filter-popover-label';
import { FilterPopoverTld } from './filter-popover-tld';

import './filter-popover.scss';

type Props = {
	addTldToFilter: ( tld: string ) => void;
	availableTlds: string[];
	exploreMoreTlds: string[];
	handleTldsChange: ( tokens: ( string | TokenItem )[] ) => void;
	onClear: () => void;
	onClose: () => void;
	recommendedTlds: string[];
	setExactSldMatchesOnlyInFilter: ( exactSldMatchesOnly: boolean ) => void;
	temporaryFilter: FilterState;
	validateTld: ( tld: string ) => boolean;
};

export const DomainSearchControlsFilterPopover = ( {
	addTldToFilter,
	availableTlds,
	exploreMoreTlds,
	handleTldsChange,
	onClear,
	onClose,
	recommendedTlds,
	setExactSldMatchesOnlyInFilter,
	temporaryFilter,
	validateTld,
}: Props ) => {
	const { __ } = useI18n();

	const generateAvailableTldsList = () => {
		const list = [];

		if ( recommendedTlds.length > 0 ) {
			list.push( { text: __( 'Recommended endings' ), isLabel: true } );
			recommendedTlds.forEach( ( tld ) => {
				list.push( { text: `.${ tld }`, isLabel: false } );
			} );
		}

		if ( exploreMoreTlds.length > 0 ) {
			list.push( { text: __( 'Explore more endings' ), isLabel: true } );
			exploreMoreTlds.forEach( ( tld ) => {
				list.push( { text: `.${ tld }`, isLabel: false } );
			} );
		}

		return list;
	};

	// Show list of available TLDs that weren't selected
	const renderAvailableTldsList = () => {
		return (
			<div className="domain-search-controls__filters-popover-available-tlds-container">
				{ generateAvailableTldsList().map( ( tld ) => {
					return tld.isLabel ? (
						<FilterPopoverLabel key={ tld.text } text={ tld.text } />
					) : (
						<FilterPopoverTld key={ tld.text } tld={ tld.text } addTldToFilter={ addTldToFilter } />
					);
				} ) }
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
