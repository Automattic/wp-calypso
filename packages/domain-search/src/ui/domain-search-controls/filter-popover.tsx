import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalScrollable as Scrollable,
	Button,
	Card,
	CheckboxControl,
	FormTokenField,
	CardBody,
} from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useState } from 'react';
import { FilterState } from '../../components/search-bar/types';
import { FilterPopoverLabel } from './filter-popover-label';
import { FilterPopoverTld } from './filter-popover-tld';

import './filter-popover.scss';

type Props = {
	availableTlds: string[];
	filter: FilterState;
	onApply: ( filter: FilterState ) => void;
	onClear: () => void;
};

export const DomainSearchControlsFilterPopover = ( {
	availableTlds,
	filter,
	onApply,
	onClear,
}: Props ) => {
	const { __ } = useI18n();
	// This is the filter that the user is currently selecting. It is only applied when the popover is closed
	const [ temporaryFilter, setTemporaryFilter ] = useState( filter );

	// Only add TLD to current selection if it exists in the available TLDs list
	const validateTld = useCallback(
		( tld: string ) => {
			return availableTlds.includes( tld );
		},
		[ availableTlds ]
	);

	const getRecommendedTlds = useCallback( () => {
		return availableTlds.slice( 0, 5 ).filter( ( tld ) => ! temporaryFilter.tlds.includes( tld ) );
	}, [ availableTlds, temporaryFilter.tlds ] );

	const getExploreMoreTlds = useCallback( () => {
		return availableTlds
			.slice( 5 )
			.sort()
			.filter( ( tld ) => ! temporaryFilter.tlds.includes( tld ) );
	}, [ availableTlds, temporaryFilter.tlds ] );

	// Generate list of available TLDs with labels separating the recommended and explore more sections
	const generateAvailableTldsList = () => {
		const list = [];

		const recommendedTlds = getRecommendedTlds();
		const exploreMoreTlds = getExploreMoreTlds();

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

	const addTldToFilter = useCallback(
		( tld: string ) => {
			if ( tld.startsWith( '.' ) ) {
				tld = tld.slice( 1 );
			}

			setTemporaryFilter( {
				...temporaryFilter,
				tlds: [ ...temporaryFilter.tlds, tld ],
			} );
		},
		[ setTemporaryFilter, temporaryFilter ]
	);

	// Show list of available TLDs that weren't selected
	const renderAvailableTldsList = () => {
		const tldList = generateAvailableTldsList();

		if ( tldList.length === 0 ) {
			return null;
		}

		return (
			<Card
				className="domain-search-controls__filters-popover-available-tlds-container"
				isRounded={ false }
			>
				<Scrollable role="listbox" scrollDirection="y" style={ { maxHeight: '18.5rem' } }>
					{ tldList.map( ( tld ) => {
						return tld.isLabel ? (
							<FilterPopoverLabel key={ tld.text } text={ tld.text } />
						) : (
							<FilterPopoverTld
								key={ tld.text }
								tld={ tld.text }
								addTldToFilter={ addTldToFilter }
							/>
						);
					} ) }
				</Scrollable>
			</Card>
		);
	};

	const setExactMatchesOnlyInFilter = useCallback(
		( exactSldMatchesOnly: boolean ) => {
			setTemporaryFilter( {
				...temporaryFilter,
				exactSldMatchesOnly,
			} );
		},
		[ setTemporaryFilter, temporaryFilter ]
	);

	return (
		<Card isBorderless size="small" className="domain-search-controls__filters-popover">
			<CardBody>
				<VStack spacing={ 4 }>
					<FormTokenField
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						__experimentalShowHowTo={ false }
						__experimentalValidateInput={ validateTld }
						value={ temporaryFilter.tlds }
						suggestions={ availableTlds }
						onChange={ ( tokens ) => {
							const tlds = tokens.map( ( token ) =>
								typeof token === 'string' ? token : token.value
							);
							setTemporaryFilter( {
								...temporaryFilter,
								tlds,
							} );
						} }
						placeholder={ __( 'Search for an ending' ) }
					/>
					{ renderAvailableTldsList() }
					<CheckboxControl
						label={ __( 'Show exact matches only' ) }
						checked={ temporaryFilter.exactSldMatchesOnly }
						onChange={ setExactMatchesOnlyInFilter }
						__nextHasNoMarginBottom
					/>
					<HStack spacing={ 4 } className="domain-search-controls__filters-popover-buttons">
						<Button __next40pxDefaultSize variant="secondary" onClick={ onClear }>
							{ __( 'Clear' ) }
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ () => {
								onApply( temporaryFilter );
							} }
						>
							{ __( 'Apply' ) }
						</Button>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
};
