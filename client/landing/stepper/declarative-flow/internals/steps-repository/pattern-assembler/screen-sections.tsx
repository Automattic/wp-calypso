import { NavigatorHeader } from '@automattic/onboarding';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { NAVIGATOR_PATHS } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import { useScreen } from './hooks';
import NavigatorTitle from './navigator-title';
import PatternCategoryList from './pattern-category-list';
import { Pattern, Category } from './types';

interface Props {
	categories: Category[];
	patternsMapByCategory: { [ key: string ]: Pattern[] };
	onContinueClick: () => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
}

const ScreenSections = ( {
	categories,
	patternsMapByCategory,
	onContinueClick,
	recordTracksEvent,
}: Props ) => {
	const translate = useTranslate();
	const { title } = useScreen( 'sections' );
	const { params, goTo } = useNavigator();
	const selectedCategory = params.categorySlug as string;

	const onSelectSectionCategory = ( category: string ) => {
		const nextPath =
			category !== selectedCategory
				? `${ NAVIGATOR_PATHS.SECTIONS }/${ category }`
				: NAVIGATOR_PATHS.SECTIONS;

		goTo( nextPath, { replace: true } );
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.CATEGORY_LIST_CATEGORY_CLICK, {
			pattern_category: category,
		} );
	};

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ title } /> }
				description={ translate(
					'Find the right patterns for you be exploring the list of categories below'
				) }
				hideBack
			/>
			<div className="screen-container__body">
				<VStack spacing="4">
					<PatternCategoryList
						categories={ categories }
						patternsMapByCategory={ patternsMapByCategory }
						selectedCategory={ selectedCategory }
						onSelectCategory={ onSelectSectionCategory }
					/>
				</VStack>
			</div>
			<div className="screen-container__footer">
				<Button className="pattern-assembler__button" variant="primary" onClick={ onContinueClick }>
					{ translate( 'Save and continue' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenSections;
