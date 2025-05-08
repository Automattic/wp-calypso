import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { profilerVersion } from 'calypso/performance-profiler/utils/profiler-version';
import { SearchableDropdown } from '@automattic/components';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { search } from '@wordpress/icons';
import { useMemo, useState, ComponentProps } from 'react';

interface PageReport {
	label: string;
	value: string;
	path: string;
	disabled: boolean;
}

interface PageSelectorProps {
	siteId: string | undefined;
	siteUrl: string | undefined;
	pages: PageReport[];
	currentPage: PageReport | undefined;
	currentPageUserSelection: PageReport | undefined;
	setCurrentPageUserSelection: ( page: PageReport | undefined ) => void;
	disableControls: boolean;
	statType: string;
	statsQuery: Record< string, unknown >;
}

interface PageSelectorProps extends ComponentProps< typeof SearchableDropdown > {
	onBlur?: ( event: React.FocusEvent< HTMLDivElement > ) => void;
}

export const PageSelector = ( { onBlur, ...props }: PageSelectorProps ) => {
	return (
		<div className="site-performance__page-selector">
			<div css={ { alignSelf: 'stretch', display: 'flex', alignItems: 'center' } }>
				{ __( 'Page' ) }
			</div>
			<div className="site-performance__page-selector-container">
				<div onBlur={ onBlur } tabIndex={ -1 }>
					<SearchableDropdown
						{ ...props }
						className="site-performance__page-selector-drowdown"
						__experimentalRenderItem={ ( { item } ) => {
							if ( item.value === '-1' ) {
								return (
									<div className="message">
										{ __( 'Performance testing is available for the 20 most popular pages.' ) }
									</div>
								);
							}
							if ( item.value === '-2' ) {
								return <div className="message">{ __( 'No pages found' ) }</div>;
							}
							return (
								<div className="site-performance__page-selector-item" aria-label={ item.label }>
									<span>{ item.label }</span>
									<span className="subtitle">{ item.path }</span>
								</div>
							);
						} }
					/>
				</div>
				<div className="site-performance__page-selector-search-icon">
					<Icon
						icon={ search }
						size={ 24 }
						style={ { fill: props.disabled ? 'var(--studio-gray-20)' : 'var(--color-neutral-50)' } }
					/>
				</div>
			</div>
		</div>
	);
};

interface PageSelectorWrapperProps {
	pages: PageReport[];
	currentPage: PageReport | undefined;
	onChange: ( page_id: string | null | undefined ) => void;
}

export const PageSelectorWrapper: React.FC< PageSelectorWrapperProps > = ( {
	pages,
	currentPage,
	onChange,
	//disableControls,
	// statType,
	// statsQuery,
} ) => {
	// const stats = useSelector( ( state ) =>
	//     getSiteStatsNormalizedData( state, siteId, statType, statsQuery )
	// ) as { id: number; value: number }[];

	const stats: { id: number; value: number }[] = [];

	// Order the page by the number of visits
	const orderedPages = useMemo( () => {
		return [ ...pages ].sort( ( a, b ) => {
			const aVisits = stats.find( ( { id } ) => id === parseInt( a.value, 10 ) )?.value ?? 0;
			const bVisits = stats.find( ( { id } ) => id === parseInt( b.value, 10 ) )?.value ?? 0;
			return bVisits - aVisits;
		} );
	}, [ pages, stats ] );

	// I DONT KNOW WHY THIS IS A THING
	// const [ prevSiteId, setPrevSiteId ] = useState( siteId );
	// if ( prevSiteId !== siteId ) {
	// 	setPrevSiteId( siteId );
	// 	onChange( undefined );
	// }

	const pageOptions = useMemo( () => {
		const options = currentPage
			? [ currentPage, ...orderedPages.filter( ( p ) => p.value !== currentPage.value ) ]
			: orderedPages;

		// Add a disabled option at the end that will show a disclaimer message.
		return [ ...options, { label: '', value: '-1', path: '', disabled: true } ];
	}, [ currentPage, orderedPages ] );

	// This forces a no pages found message in the dropdown
	const [ noPagesFound, setNoPagesFound ] = useState( { query: '', found: true } );

	// Replace the options array with a no pages found message if no pages are found.
	const options = ! noPagesFound.found
		? [
				{
					label: noPagesFound.query,
					value: '-2',
					disabled: true,
				},
		  ]
		: pageOptions;

	return (
		<PageSelector
			onFilterValueChange={ ( value ) => {
				const filter = pageOptions.find( ( option ) =>
					option.label.toLowerCase().startsWith( value.toLowerCase() )
				);

				if ( filter ) {
					setNoPagesFound( { query: '', found: true } );
					return;
				}
				setNoPagesFound( { query: value, found: false } );
			} }
			allowReset={ false }
			onBlur={ () => {
				// if no pages found, reset so that the previous selected page is shown
				if ( ! noPagesFound.found ) {
					setNoPagesFound( { query: '', found: true } );
				}
			} }
			options={ options }
			disabled={ false }
			onChange={ ( page_id ) => {
				recordTracksEvent( 'calypso_performance_profiler_page_selector_change', {
					is_home: page_id === '0',
					version: profilerVersion(),
				} );

				const url = new URL( window.location.href );
				if ( page_id ) {
					url.searchParams.set( 'page_id', page_id );
				} else {
					url.searchParams.delete( 'page_id' );
				}

				window.history.replaceState( {}, '', url.toString() );
				onChange( page_id );
			} }
			value={ currentPage?.value }
		/>
	);
};
