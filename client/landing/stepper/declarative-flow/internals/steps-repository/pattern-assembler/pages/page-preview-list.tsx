import { useGlobalStyle } from '@automattic/global-styles';
import {
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
} from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { CSSProperties, useCallback, useMemo, useState } from 'react';
import { injectTitlesToPageListBlock } from '../html-transformers';
import PagePreview from './page-preview';
import type { Pattern } from '../types';
import './page-preview-list.scss';

interface Props {
	selectedHeader: Pattern | null;
	selectedSections: Pattern[];
	selectedFooter: Pattern | null;
	selectedPages: Pattern[];
	selectedPageSlugs: string[];
	isNewSite: boolean;
}

const PagePreviewList = ( {
	selectedHeader,
	selectedSections,
	selectedFooter,
	selectedPages,
	selectedPageSlugs,
	isNewSite,
}: Props ) => {
	const translate = useTranslate();
	const composite = useCompositeState( { orientation: 'horizontal' } );
	const [ isFullscreenPreview, setIsFullscreenPreview ] = useState( false );

	const [ backgroundColor ] = useGlobalStyle( 'color.background' );
	const pagePreviewStyle = useMemo(
		() => ( { '--page-preview-background': backgroundColor } ) as CSSProperties,
		[ backgroundColor ]
	);

	const homepage = useMemo(
		() => [ selectedHeader, ...selectedSections, selectedFooter ].filter( Boolean ) as Pattern[],
		[ selectedHeader, selectedSections, selectedFooter ]
	);

	const transformPatternHtml = useCallback(
		( patternHtml: string ) => {
			const pageTitles = selectedPages.map( ( page ) => page.title );
			return injectTitlesToPageListBlock( patternHtml, pageTitles, {
				replaceCurrentPages: isNewSite,
			} );
		},
		[ isNewSite, selectedPages ]
	);

	const handleFullscreenEnter = () => {
		setIsFullscreenPreview( true );
	};

	const handleFullscreenLeave = () => {
		// The timeout delay should match the CSS transition timing of the element.
		setTimeout( () => setIsFullscreenPreview( false ), 200 );
	};

	return (
		<>
			<Composite
				{ ...composite }
				role="listbox"
				className={ clsx( 'pattern-assembler__preview-list', {
					'pattern-assembler__preview-list--fullscreen-preview': isFullscreenPreview,
				} ) }
			>
				<PagePreview
					composite={ composite }
					slug="homepage"
					title={ translate( 'Homepage' ) }
					style={ pagePreviewStyle }
					patterns={ homepage }
					transformPatternHtml={ transformPatternHtml }
					onFullscreenEnter={ handleFullscreenEnter }
					onFullscreenLeave={ handleFullscreenLeave }
				/>
				{ selectedPages.map( ( page, index ) => (
					<PagePreview
						key={ page.ID }
						composite={ composite }
						slug={ selectedPageSlugs[ index ] }
						title={ page.title }
						style={ pagePreviewStyle }
						patterns={ [
							...( selectedHeader ? [ selectedHeader ] : [] ),
							page,
							...( selectedFooter ? [ selectedFooter ] : [] ),
						] }
						transformPatternHtml={ transformPatternHtml }
						onFullscreenEnter={ handleFullscreenEnter }
						onFullscreenLeave={ handleFullscreenLeave }
					/>
				) ) }
			</Composite>
		</>
	);
};

export default PagePreviewList;
