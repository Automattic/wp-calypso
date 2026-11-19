import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Field, Select, Stack } from '@wordpress/ui';
import { useMemo } from 'react';
import { VIEWPORT_BREAKPOINTS } from './constants';
import type { SitePerformancePage } from '@automattic/api-core';
import './page-selector.scss';

interface PageItem {
	value: string;
	label: string;
	path: string;
}

function mapPageToItem( page: SitePerformancePage, siteUrl: string ): PageItem {
	const label = page.title.rendered || __( 'No title' );
	const path = page.link.replace( siteUrl ?? '', '' );

	return {
		value: page.id.toString(),
		label: label.replace( /&nbsp;/g, ' ' ),
		path: path.length > 1 ? path.replace( /\/$/, '' ) : path,
	};
}

export default function PageSelector( {
	siteUrl,
	pages,
	currentPage,
	isLoading,
	onChange,
}: {
	siteUrl: string;
	pages: SitePerformancePage[];
	currentPage: SitePerformancePage | undefined;
	isLoading: boolean;
	onChange: ( page_id: string | null ) => void;
} ) {
	const isDesktop = useViewportMatch( VIEWPORT_BREAKPOINTS.desktop );
	const pageItems = useMemo(
		() => pages.map( ( page ) => mapPageToItem( page, siteUrl ) ),
		[ pages, siteUrl ]
	);
	const selectedPageId = currentPage ? currentPage.id.toString() : null;

	return (
		<Field.Root
			className="performance-page-selector"
			render={ <Stack direction="row" align="center" gap="sm" /> }
		>
			<Field.Label hideFromVision={ ! isDesktop }>{ __( 'Page' ) }</Field.Label>
			<Select.Root< string >
				items={ pageItems }
				value={ selectedPageId }
				onValueChange={ ( pageId ) => {
					if ( pageId !== selectedPageId ) {
						onChange( pageId );
					}
				} }
				disabled={ isLoading || ! pageItems.length }
			>
				<Select.Trigger
					className="performance-page-selector__trigger"
					placeholder={ isLoading ? __( 'Loading pages…' ) : __( 'No pages found' ) }
				/>
				<Select.Popup positioner={ <Select.Positioner alignItemWithTrigger={ false } /> }>
					<Select.Group>
						<Select.GroupLabel>{ __( '20 most popular pages' ) }</Select.GroupLabel>
						{ pageItems.map( ( item ) => (
							<Select.Item key={ item.value } value={ item.value } label={ item.label }>
								<Select.ItemLabel>{ item.label }</Select.ItemLabel>
								<Select.ItemDescription>{ item.path }</Select.ItemDescription>
							</Select.Item>
						) ) }
					</Select.Group>
				</Select.Popup>
			</Select.Root>
		</Field.Root>
	);
}
