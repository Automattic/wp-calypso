import { NavigatorHeader } from '@automattic/onboarding';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
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
	const { title, description, continueLabel } = useScreen( 'sections' );
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
				description={ description }
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
					{ continueLabel }
				</Button>
			</div>
		</>
	);
};

export default ScreenSections;
