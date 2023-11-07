import { useGlobalStyle } from '@automattic/global-styles';
import {
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { CSSProperties, useMemo, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import PatternPagePreview, { PatternPagePreviewModal } from './pattern-page-preview';
import type { Pattern } from './types';
import './pattern-page-preview-list.scss';

interface Props {
	selectedHeader: Pattern | null;
	selectedSections: Pattern[];
	selectedFooter: Pattern | null;
	selectedPages: string[];
	pagesMapByCategory: { [ key: string ]: Pattern[] };
	isNewSite: boolean;
}

const PatternPagePreviewList = ( {
	selectedHeader,
	selectedSections,
	selectedFooter,
	selectedPages,
	pagesMapByCategory,
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
	const patternPagePreviewStyle = useMemo(
		() => ( { '--pattern-page-preview-background': backgroundColor } ) as CSSProperties,
		[ backgroundColor ]
	);

	const pages = useMemo(
		() => selectedPages.map( ( slug ) => pagesMapByCategory[ slug ]?.[ 0 ] ).filter( Boolean ),
		[ selectedPages, pagesMapByCategory ]
	);

	const homepage = useMemo(
		() => [ selectedHeader, ...selectedSections, selectedFooter ].filter( Boolean ) as Pattern[],
		[ selectedHeader, selectedSections, selectedFooter ]
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
				<PatternPagePreview
					composite={ composite }
					title={ translate( 'Homepage' ) }
					style={ patternPagePreviewStyle }
					patterns={ homepage }
					shouldShufflePosts={ isNewSite }
					onClick={ ( patterns ) => handleClick( patterns, 'homepage' ) }
				/>
				{ pages.map( ( page, index ) => (
					<PatternPagePreview
						key={ page.ID }
						composite={ composite }
						style={ patternPagePreviewStyle }
						title={ page.title }
						patterns={ [
							...( selectedHeader ? [ selectedHeader ] : [] ),
							page,
							...( selectedFooter ? [ selectedFooter ] : [] ),
						] }
						shouldShufflePosts={ isNewSite }
						onClick={ ( patterns ) => handleClick( patterns, selectedPages[ index ] ) }
					/>
				) ) }
			</Composite>
			<PatternPagePreviewModal
				style={ patternPagePreviewStyle }
				patterns={ zoomedPage }
				shouldShufflePosts={ isNewSite }
				isOpen={ isModalOpen }
				onClose={ () => setIsModalOpen( false ) }
			/>
		</>
	);
};

export default PatternPagePreviewList;
