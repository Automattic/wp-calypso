import { Dropdown } from '@wordpress/components';
import { useCallback, useMemo, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { FilterState } from '../../page/types';
import { DomainSearchControls } from '../../ui';
import type { TokenItem } from '@wordpress/components/build-types/form-token-field/types';

const emptyFilter: FilterState = {
	exactMatchesOnly: false,
	tlds: [],
};

type Props = {
	onSubmit?: () => void;
};

export const Filter = ( { onSubmit }: Props ) => {
	const { filter, setFilter } = useDomainSearch();
	// This is the filter that the user is currently selecting. It is only applied when the popover is closed
	const [ temporaryFilter, setTemporaryFilter ] = useState( emptyFilter );
	// TODO: Hardcoded for testing, should get those from the https://public-api.wordpress.com/rest/v1.1/domains/suggestions/tlds endpoint
	const availableTlds = useMemo(
		() => [ 'com', 'net', 'org', 'blog', 'dev', 'io', 'co', 'co.uk', 'com.br', 'de' ],
		[]
	);

	const resetFilter = useCallback( () => {
		setFilter( emptyFilter );
		setTemporaryFilter( emptyFilter );
	}, [ setFilter ] );

	const getFiltercounts = useCallback( () => {
		return filter.tlds.length + ( filter.exactMatchesOnly ? 1 : 0 );
	}, [ filter ] );

	const setTldsInFilter = useCallback(
		( tlds: string[] ) => {
			setTemporaryFilter( {
				...temporaryFilter,
				tlds,
			} );
		},
		[ setTemporaryFilter, temporaryFilter ]
	);

	const addTldToFilter = ( tld: string ) => {
		if ( tld.startsWith( '.' ) ) {
			tld = tld.slice( 1 );
		}

		setTemporaryFilter( {
			...temporaryFilter,
			tlds: [ ...temporaryFilter.tlds, tld ],
		} );
	};

	const setExactMatchesOnlyInFilter = useCallback(
		( exactMatchesOnly: boolean ) => {
			setTemporaryFilter( {
				...temporaryFilter,
				exactMatchesOnly,
			} );
		},
		[ setTemporaryFilter, temporaryFilter ]
	);

	const handleTldsChange = ( tokens: ( string | TokenItem )[] ) => {
		const tlds = tokens.map( ( token ) => ( typeof token === 'string' ? token : token.value ) );
		setTldsInFilter( tlds );
	};

	return (
		<Dropdown
			showArrow={ false }
			popoverProps={ { placement: 'bottom-end', offset: 10, noArrow: false } }
			renderToggle={ ( { onToggle } ) => {
				return (
					<DomainSearchControls.FilterButton count={ getFiltercounts() } onClick={ onToggle } />
				);
			} }
			renderContent={ ( { onClose } ) => {
				return (
					<DomainSearchControls.FilterPopover
						addTldToFilter={ addTldToFilter }
						availableTlds={ availableTlds }
						handleTldsChange={ handleTldsChange }
						onClear={ () => {
							onClose();
							resetFilter();
						} }
						onClose={ onClose }
						setExactMatchesOnlyInFilter={ setExactMatchesOnlyInFilter }
						temporaryFilter={ temporaryFilter }
					/>
				);
			} }
			onClose={ () => {
				setFilter( temporaryFilter );
				onSubmit?.();
			} }
		/>
	);
};
