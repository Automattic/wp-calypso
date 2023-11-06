import { useGlobalStyle } from '@automattic/global-styles';
import {
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { CSSProperties, useMemo, useState } from 'react';
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

	const handleClick = ( patterns: Pattern[] ) => {
		setZoomedPage( patterns );
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
					onClick={ handleClick }
				/>
				{ pages.map( ( page ) => (
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
						onClick={ handleClick }
					/>
				) ) }
			</Composite>
			<PatternPagePreviewModal
				style={ patternPagePreviewStyle }
				patterns={ zoomedPage }
				shouldShufflePosts={ isNewSite }
				isOpen={ !! zoomedPage.length }
				onClose={ () => setZoomedPage( [] ) }
			/>
		</>
	);
};

export default PatternPagePreviewList;
