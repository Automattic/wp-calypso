import page from '@automattic/calypso-router';
import { SearchableDropdown } from '@automattic/components';
import { useDebouncedInput } from '@wordpress/compose';
import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { useSitePages } from '../hooks/useSitePages';

export const PageSelector = () => {
	const queryParams = useSelector( getCurrentQueryArguments );
	const [ , setQuery, query ] = useDebouncedInput();
	const pages = useSitePages( { query } );

	return (
		<>
			<SearchableDropdown
				onFilterValueChange={ setQuery }
				options={ pages }
				value={ queryParams?.page_id?.toString() }
				onChange={ ( page_id ) => {
					const url = new URL( window.location.href );

					if ( page_id ) {
						url.searchParams.set( 'page_id', page_id );
					} else {
						url.searchParams.delete( 'page_id' );
					}

					page.replace( url.pathname + url.search );
				} }
				css={ {
					maxWidth: '240px',
					'.components-form-token-field__suggestions-list': { maxHeight: 'initial !important' },
					'.components-form-token-field__suggestions-list li': { padding: '0 !important' },
				} }
				__experimentalRenderItem={ ( { item } ) => (
					<div
						aria-label={ item.label }
						css={ {
							display: 'flex',
							flexDirection: 'column',
							paddingInline: '16px',
							paddingBlock: '8px',
						} }
					>
						<span>{ item.label }</span>
						<span>{ item.url }</span>
					</div>
				) }
			/>
		</>
	);
};
