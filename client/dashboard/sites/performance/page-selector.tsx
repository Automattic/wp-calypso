import { ComboboxControl, __experimentalVStack as VStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { Text } from '../../components/text';
import type { SitePerformancePage } from '@automattic/api-core';

import './page-selector.scss';

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
function mapPageToPageOption( page: SitePerformancePage, siteUrl: string ): PageOption {
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

export default function PageSelector( {
	siteUrl,
	pages,
	currentPage,
	onChange,
}: {
	siteUrl: string;
	pages: SitePerformancePage[];
	currentPage: SitePerformancePage | undefined;
	onChange: ( page_id: string | null | undefined ) => void;
} ) {
	const isDesktop = useViewportMatch( 'medium' );

	const currentPageOption: PageOption | undefined = currentPage
		? mapPageToPageOption( currentPage, siteUrl )
		: undefined;

	const pageOptions = useMemo( () => {
		if ( ! pages ) {
			return [];
		}

		const mappedPages: PageOption[] = pages.map( ( page: SitePerformancePage ) =>
			mapPageToPageOption( page, siteUrl )
		);

		return [ ...mappedPages, { label: '', value: '-1', path: '', disabled: true } ];
	}, [ pages, siteUrl ] );

	return (
		<div className="performance-page-selector">
			<ComboboxControl
				label={ __( 'Page' ) }
				allowReset={ false }
				options={ pageOptions }
				hideLabelFromVision={ isDesktop ? false : true }
				value={ currentPageOption?.value }
				onChange={ onChange }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				__experimentalRenderItem={ ( { item } ) => {
					if ( item.value === '-1' ) {
						return pages.length ? (
							<Text variant="muted">
								{ __( 'Performance testing is available for the 20 most popular pages.' ) }
							</Text>
						) : (
							<Text variant="muted">{ __( 'No pages found.' ) }</Text>
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
