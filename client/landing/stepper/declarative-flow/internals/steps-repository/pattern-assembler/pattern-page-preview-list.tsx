import { useGlobalStyle } from '@automattic/global-styles';
import { useTranslate } from 'i18n-calypso';
import { CSSProperties, useMemo } from 'react';
import PatternPagePreview from './pattern-page-preview';
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

	return (
		<div className="pattern-assembler__preview-list">
			<PatternPagePreview
				title={ translate( 'Homepage' ) }
				style={ patternPagePreviewStyle }
				patterns={ homepage }
				shouldShufflePosts={ isNewSite }
			/>
			{ pages.map( ( page ) => (
				<PatternPagePreview
					key={ page.ID }
					style={ patternPagePreviewStyle }
					title={ page.title }
					patterns={ [
						...( selectedHeader ? [ selectedHeader ] : [] ),
						page,
						...( selectedFooter ? [ selectedFooter ] : [] ),
					] }
					shouldShufflePosts={ false }
				/>
			) ) }
		</div>
	);
};

export default PatternPagePreviewList;
