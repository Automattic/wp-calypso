import { useGlobalStyle } from '@automattic/global-styles';
import {
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { CSSProperties, useCallback, useMemo, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PATTERN_ASSEMBLER_EVENTS } from '../events';
import { injectTitlesToPageListBlock } from '../html-transformers';
import PagePreview, { PagePreviewModal } from './page-preview';
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
	const [ zoomedPage, setZoomedPage ] = useState< Pattern[] >( [] );

	// Using zoomedPage to control whether the modal is opened or not causes a flash of empty content.
	// To prevent this, we use another separate state.
	// See: https://github.com/Automattic/wp-calypso/pull/83902#discussion_r1383357522.
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const [ backgroundColor ] = useGlobalStyle( 'color.background' );
	const pagePreviewStyle = useMemo(
		() => ( { '--page-preview-background': backgroundColor } ) as CSSProperties,
		[ backgroundColor ]
	);

	const pageTitles = useMemo(
		() => selectedPages.map( ( page ) => page.title ),
		[ selectedPages ]
	);

	const homepage = useMemo(
		() => [ selectedHeader, ...selectedSections, selectedFooter ].filter( Boolean ) as Pattern[],
		[ selectedHeader, selectedSections, selectedFooter ]
	);

	const transformPatternHtml = useCallback(
		( patternHtml: string ) => {
			return injectTitlesToPageListBlock( patternHtml, pageTitles, {
				replaceCurrentPages: isNewSite,
			} );
		},
		[ isNewSite, pageTitles ]
	);

	const handleClick = ( patterns: Pattern[], pageSlug: string ) => {
		setZoomedPage( patterns );
		setIsModalOpen( true );

		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_PAGES_PAGE_PREVIEW_CLICK, {
			pattern_names: patterns.map( ( pattern ) => pattern.name ).join( ',' ),
			page_slug: pageSlug,
		} );
	};

	return (
		<>
			<Composite { ...composite } role="listbox" className="pattern-assembler__preview-list">
				<PagePreview
					composite={ composite }
					title={ translate( 'Homepage' ) }
					style={ pagePreviewStyle }
					patterns={ homepage }
					transformPatternHtml={ transformPatternHtml }
					shouldShufflePosts={ isNewSite }
					onClick={ ( patterns ) => handleClick( patterns, 'homepage' ) }
				/>
				{ selectedPages.map( ( page, index ) => (
					<PagePreview
						key={ page.ID }
						composite={ composite }
						style={ pagePreviewStyle }
						title={ page.title }
						patterns={ [
							...( selectedHeader ? [ selectedHeader ] : [] ),
							page,
							...( selectedFooter ? [ selectedFooter ] : [] ),
						] }
						transformPatternHtml={ transformPatternHtml }
						shouldShufflePosts={ isNewSite }
						onClick={ ( patterns ) => handleClick( patterns, selectedPageSlugs[ index ] ) }
					/>
				) ) }
			</Composite>
			<PagePreviewModal
				style={ pagePreviewStyle }
				patterns={ zoomedPage }
				transformPatternHtml={ transformPatternHtml }
				shouldShufflePosts={ isNewSite }
				isOpen={ isModalOpen }
				onClose={ () => setIsModalOpen( false ) }
			/>
		</>
	);
};

export default PagePreviewList;
