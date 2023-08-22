import { __experimentalUseNavigator as useNavigator } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PatternListPanel from './pattern-list-panel';
import type { Pattern, Category, PanelObject } from './types';

interface Props {
	categories: Category[];
	selectedHeader: Pattern | null;
	selectedFooter: Pattern | null;
	selectedSections: Pattern[];
	patternsMapByCategory: { [ key: string ]: Pattern[] };
	onSelect: (
		type: string,
		selectedPattern: Pattern | null,
		selectedCategory: string | null
	) => void;
}

const ScreenPatternListPanel = ( {
	selectedHeader,
	selectedFooter,
	selectedSections,
	...props
}: Props ) => {
	const translate = useTranslate();
	const navigator = useNavigator();
	const selectedCategory = navigator.params.categorySlug as string;
	const panels: Record< string, PanelObject > = {
		header: {
			type: 'header',
			title: translate( 'Header' ),
			description: translate(
				'Pick the header that appears at the top of every page and shows your site logo, title and navigation.'
			),
			category: 'header',
			selectedPattern: selectedHeader,
		},
		footer: {
			type: 'footer',
			title: translate( 'Footer' ),
			description: translate(
				'Pick the footer that appears at the bottom of every page and shows useful links and contact information.'
			),
			category: 'footer',
			selectedPattern: selectedFooter,
		},
		default: {
			type: 'section',
			selectedPattern: null,
			selectedPatterns: selectedSections,
		},
	};

	const currentPanel = panels[ selectedCategory ] || panels.default;

	return (
		<PatternListPanel { ...props } { ...currentPanel } selectedCategory={ selectedCategory } />
	);
};

export default ScreenPatternListPanel;
