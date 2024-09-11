import page from '@automattic/calypso-router';
import { SearchableDropdown } from '@automattic/components';
import { useDebouncedInput } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import QueryPosts from 'calypso/components/data/query-posts';
import { useSelector } from 'calypso/state';
import { getPostsForQueryIgnoringPage } from 'calypso/state/posts/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { getSelectedSite } from 'calypso/state/ui/selectors';

interface Page {
	slug: string;
	URL: string;
	title: string;
}

const PER_PAGE = 10;

export const PageSelector = () => {
	const { __ } = useI18n();

	const queryParams = useSelector( getCurrentQueryArguments );
	const site = useSelector( getSelectedSite );

	const [ , setPageQuery, pageQuery ] = useDebouncedInput();
	const query = { type: 'page', number: PER_PAGE, search: pageQuery, page: 1 };
	const pages = useSelector( ( state ): Page[] | null =>
		getPostsForQueryIgnoringPage( state, site?.ID, query )
	);

	const options = useMemo( () => {
		const mappedPages =
			pages?.map( ( page ) => {
				let url = page.URL.replace( site?.URL ?? '', '' );
				url = url.length > 1 ? url.replace( /\/$/, '' ) : url;

				return {
					URL: url,
					label: page.title,
					value: url,
				};
			} ) ?? [];

		if ( pageQuery.length > 0 ) {
			return mappedPages;
		}

		return [ { URL: '/', label: __( 'Home' ), value: '/' }, ...mappedPages ];
	}, [ pageQuery.length, pages, site?.URL, __ ] );

	return (
		<>
			<QueryPosts postId={ null } siteId={ site?.ID } query={ query } />
			<SearchableDropdown
				onFilterValueChange={ setPageQuery }
				options={ options }
				value={ queryParams?.page_slug?.toString() ?? '/' }
				onChange={ ( slug ) => {
					const url = new URL( window.location.href );

					if ( slug ) {
						url.searchParams.set( 'page_slug', slug );
					} else {
						url.searchParams.delete( 'page_slug' );
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
						<span>{ item.URL }</span>
					</div>
				) }
			/>
		</>
	);
};
