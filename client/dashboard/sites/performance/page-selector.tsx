import { SearchableDropdown } from '@automattic/components';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { search } from '@wordpress/icons';
import { useMemo, useState, ComponentProps } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { profilerVersion } from 'calypso/performance-profiler/utils/profiler-version';
import type { PerformanceProfilerPage } from '../../data';

interface PageOption {
	url: string;
	path: string;
	label: string;
	value: string;
	disabled: boolean;
	wpcom_performance_report_hash: string;
}

interface PageSelectorProps {
	siteId: string | undefined;
	siteUrl: string | undefined;
	pages: PageOption[];
	currentPage: PageOption | undefined;
	currentPageUserSelection: PageOption | undefined;
	setCurrentPageUserSelection: ( page: PageOption | undefined ) => void;
	disableControls: boolean;
	statType: string;
	statsQuery: Record< string, unknown >;
}

interface PageSelectorProps extends ComponentProps< typeof SearchableDropdown > {
	disabled: boolean;
	onBlur?: ( event: React.FocusEvent< HTMLDivElement > ) => void;
}

/**
 * Map a PerformanceProfilerPage to a PageReport
 * @param page - The PerformanceProfilerPage to map
 * @param siteUrl - The URL of the site
 * @returns The PageReport
 */
const mapPageToPageOption = ( page: PerformanceProfilerPage, siteUrl: string ): PageOption => {
	let path = page.link.replace( siteUrl ?? '', '' );
	path = path.length > 1 ? path.replace( /\/$/, '' ) : path;

	return {
		url: page.link,
		path,
		label: page.title.rendered || __( 'No Title' ),
		value: page.id.toString(),
		disabled: false,
		wpcom_performance_report_hash: page.wpcom_performance_report_hash,
	};
};

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
	siteUrl: string;
	pages: PerformanceProfilerPage[];
	currentPage: PerformanceProfilerPage | undefined;
	disabled: boolean;
	onChange: ( page_id: string | null | undefined ) => void;
}

export const PageSelectorWrapper: React.FC< PageSelectorWrapperProps > = ( {
	siteUrl,
	pages,
	currentPage,
	onChange,
	disabled,
} ) => {
	const currentPageOption: PageOption | undefined = currentPage
		? mapPageToPageOption( currentPage, siteUrl )
		: undefined;

	const pageOptions = useMemo( () => {
		if ( ! pages ) {
			return [];
		}

		const mappedPages: PageOption[] = pages.map( ( page: PerformanceProfilerPage ) =>
			mapPageToPageOption( page, siteUrl )
		);

		// Move current page to the top of the list
		const options: PageOption[] = currentPageOption
			? [ currentPageOption, ...mappedPages.filter( ( p ) => p.value !== currentPageOption.value ) ]
			: mappedPages;

		return [ ...options, { label: '', value: '-1', path: '', disabled: true } ];
	}, [ pages, siteUrl, currentPageOption ] );

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
			disabled={ disabled }
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
			value={ currentPageOption?.value }
		/>
	);
};
