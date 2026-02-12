import { CustomSelectControl } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import type { SitePerformancePage } from '@automattic/api-core';
import type { CSSProperties } from 'react';
import './page-selector.scss';

interface PageOption {
	key: string;
	name: string;
	hint?: string;
	style?: CSSProperties;
}

const defaultStyle = {
	lineHeight: 1.2,
};

function mapPageToPageOption( page: SitePerformancePage, siteUrl: string ): PageOption {
	const key = page.id.toString();
	const name = page.title.rendered || __( 'No title' );
	const path = page.link.replace( siteUrl ?? '', '' );

	return {
		key,
		name: name.replace( /&nbsp;/g, ' ' ),
		hint: path.length > 1 ? path.replace( /\/$/, '' ) : path,
		style: defaultStyle,
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
	const pageOptions = useMemo( () => {
		if ( ! pages ) {
			return [];
		}

		const mappedPages: PageOption[] = pages.map( ( page: SitePerformancePage ) =>
			mapPageToPageOption( page, siteUrl )
		);

		return [
			...mappedPages,
			{
				key: '-1',
				name: __( 'Performance testing is available for the 20 most popular pages.' ),
				style: {
					...defaultStyle,
					color: '#949494',
					pointerEvents: 'none' as const,
				},
			},
		];
	}, [ pages, siteUrl ] );

	const currentPageOption: PageOption | undefined = currentPage
		? pageOptions.find( ( pageOptions ) => pageOptions.key === currentPage.id.toString() )
		: undefined;

	const handleChange = ( { selectedItem }: { selectedItem: PageOption } ) => {
		onChange( selectedItem.key );
	};

	return (
		<CustomSelectControl
			className="performance-page-selector"
			label={ __( 'Page' ) }
			value={ currentPageOption }
			options={ pageOptions }
			__next40pxDefaultSize
			hideLabelFromVision={ isDesktop ? false : true }
			onChange={ handleChange }
		/>
	);
}
