import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { NavigatorHeader, NavigatorItem, NavigatorItemGroup } from '@automattic/onboarding';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { header, footer, layout } from '@wordpress/icons';
import i18n, { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { NAVIGATOR_PATHS, INITIAL_CATEGORY } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import { useScreen } from './hooks';
import NavigatorTitle from './navigator-title';
import PatternCategoryList from './pattern-category-list';
import Survey from './survey';
import { Pattern, Category } from './types';

interface Props {
	onMainItemSelect: ( name: string ) => void;
	onContinueClick: ( callback?: () => void ) => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
	surveyDismissed: boolean;
	setSurveyDismissed: ( dismissed: boolean ) => void;
	hasSections: boolean;
	hasHeader: boolean;
	hasFooter: boolean;
	categories: Category[];
	patternsMapByCategory: { [ key: string ]: Pattern[] };
}

const ScreenMain = ( {
	onMainItemSelect,
	recordTracksEvent,
	surveyDismissed,
	setSurveyDismissed,
	hasSections,
	hasHeader,
	hasFooter,
	categories,
	patternsMapByCategory,
}: Props ) => {
	const translate = useTranslate();
	const { title } = useScreen( 'main' );
	const isEnglishLocale = useIsEnglishLocale();
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const { location, params, goTo } = useNavigator();
	const navigatorOptions = { replace: true };
	const selectedCategory = params.categorySlug as string;
	const shouldOpenCategoryList =
		!! selectedCategory && selectedCategory !== 'header' && selectedCategory !== 'footer';
	const isButtonDisabled = ! hasSections && ! hasHeader && ! hasFooter;
	const buttonText =
		isEnglishLocale || i18n.hasTranslation( 'Pick your style' )
			? translate( 'Pick your style' )
			: translate( 'Save and continue' );

	const handleClick = () => {
		goTo( NAVIGATOR_PATHS.STYLES_COLORS );
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_CONTINUE_CLICK, {
			screen_from: 'main',
			screen_to: 'styles',
		} );
	};

	const handleNavigatorItemSelect = ( type: string, category: string ) => {
		const nextPath =
			category === selectedCategory || ( shouldOpenCategoryList && category === INITIAL_CATEGORY )
				? NAVIGATOR_PATHS.MAIN
				: `/main/${ category }`;

		goTo( nextPath, navigatorOptions );
		onMainItemSelect( type );
	};

	const onSelectSectionCategory = ( category: string ) => {
		goTo( `/main/${ category }`, navigatorOptions );
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.CATEGORY_LIST_CATEGORY_CLICK, {
			pattern_category: category,
		} );
	};

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ title } /> }
				description={ translate(
					'Create your homepage by first adding patterns and then choosing a color palette and font style.'
				) }
				hideBack
			/>
			<div className="screen-container__body" ref={ wrapperRef }>
				<VStack spacing="4">
					<NavigatorItemGroup title={ translate( 'Patterns' ) }>
						<NavigatorItem
							checked={ hasHeader }
							icon={ header }
							aria-label={ translate( 'Header' ) }
							onClick={ () => handleNavigatorItemSelect( 'header', 'header' ) }
							active={ location.path === NAVIGATOR_PATHS.MAIN_HEADER }
						>
							{ translate( 'Header' ) }
						</NavigatorItem>
						<NavigatorItem
							checked={ hasSections }
							icon={ layout }
							aria-label={ translate( 'Sections' ) }
							onClick={ () => handleNavigatorItemSelect( 'section', INITIAL_CATEGORY ) }
							active={ shouldOpenCategoryList }
							hasNestedItems
						>
							{ translate( 'Sections' ) }
						</NavigatorItem>

						{ shouldOpenCategoryList && (
							<PatternCategoryList
								categories={ categories }
								patternsMapByCategory={ patternsMapByCategory }
								selectedCategory={ selectedCategory }
								onSelectCategory={ onSelectSectionCategory }
							/>
						) }

						<NavigatorItem
							checked={ hasFooter }
							icon={ footer }
							aria-label={ translate( 'Footer' ) }
							onClick={ () => handleNavigatorItemSelect( 'footer', 'footer' ) }
							active={ location.path === NAVIGATOR_PATHS.MAIN_FOOTER }
						>
							{ translate( 'Footer' ) }
						</NavigatorItem>
					</NavigatorItemGroup>
				</VStack>
				{ ! surveyDismissed && <Survey setSurveyDismissed={ setSurveyDismissed } /> }
			</div>
			<div className="screen-container__footer">
				<Button
					className="pattern-assembler__button"
					disabled={ isButtonDisabled }
					showTooltip={ isButtonDisabled }
					onClick={ handleClick }
					label={
						isButtonDisabled ? translate( 'Add your first pattern to get started.' ) : buttonText
					}
					variant="primary"
					text={ buttonText }
					__experimentalIsFocusable
				/>
			</div>
		</>
	);
};

export default ScreenMain;
