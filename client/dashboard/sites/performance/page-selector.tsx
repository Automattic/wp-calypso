import {
	ComboboxControl,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { profilerVersion } from '../../../performance-profiler/utils/profiler-version';
import { useAnalytics } from '../../app/analytics';
import type { PerformanceProfilerPage } from '@automattic/api-core';

interface PageOption {
	url: string;
	path: string;
	label: string;
	value: string;
	disabled: boolean;
	wpcom_performance_report_hash: string;
}

/**
 * Map a PerformanceProfilerPage to a PageReport
 * @param page - The PerformanceProfilerPage to map
 * @param siteUrl - The URL of the site
 * @returns The PageReport
 */
function mapPageToPageOption( page: PerformanceProfilerPage, siteUrl: string ): PageOption {
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
}

interface PageSelectorProps {
	siteUrl: string;
	pages: PerformanceProfilerPage[];
	currentPage: PerformanceProfilerPage | undefined;
	onChange: ( page_id: string | null | undefined ) => void;
}

export default function PageSelector( {
	siteUrl,
	pages,
	currentPage,
	onChange,
}: PageSelectorProps ) {
	const { recordTracksEvent } = useAnalytics();

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

	return (
		<div className="performance-page-selector">
			<ComboboxControl
				label={ __( 'Page' ) }
				allowReset={ false }
				options={ pageOptions }
				value={ currentPageOption?.value }
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
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				__experimentalRenderItem={ ( { item } ) => {
					if ( item.value === '-1' ) {
						return (
							<Text variant="muted">
								{ __( 'Performance testing is available for the 20 most popular pages.' ) }
							</Text>
						);
					}
					return (
						<VStack spacing="0">
							<Text>{ item.label }</Text>
							<Text variant="muted">{ item.path }</Text>
						</VStack>
					);
				} }
			/>
		</div>
	);
}
