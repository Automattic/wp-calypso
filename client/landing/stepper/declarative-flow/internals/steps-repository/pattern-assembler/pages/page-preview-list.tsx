import { useGlobalStyle } from '@automattic/global-styles';
import {
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { CSSProperties, useCallback, useMemo } from 'react';
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

	return (
		<>
			<Composite { ...composite } role="listbox" className="pattern-assembler__preview-list">
				<PagePreview
					composite={ composite }
					slug="homepage"
					title={ translate( 'Homepage' ) }
					style={ pagePreviewStyle }
					patterns={ homepage }
					transformPatternHtml={ transformPatternHtml }
					shouldShufflePosts={ isNewSite }
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
						shouldShufflePosts={ isNewSite }
					/>
				) ) }
			</Composite>
		</>
	);
};

export default PagePreviewList;
