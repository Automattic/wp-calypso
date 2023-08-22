import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { NavigatorHeader, NavigatorItem, NavigatorItemGroup } from '@automattic/onboarding';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { focus } from '@wordpress/dom';
import { header, footer, layout } from '@wordpress/icons';
import i18n, { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { CATEGORY_ALL_SLUG, NAVIGATOR_PATHS } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import NavigatorTitle from './navigator-title';
import PatternCategoryList from './pattern-category-list';
import Survey from './survey';
import { Pattern, Category } from './types';
import { replaceCategoryAllName } from './utils';

interface Props {
	onMainItemSelect: ( name: string ) => void;
	onContinueClick: ( callback?: () => void ) => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
	surveyDismissed: boolean;
	setSurveyDismissed: ( dismissed: boolean ) => void;
	selectedSections: Pattern[];
	selectedHeader: Pattern | null;
	selectedFooter: Pattern | null;
	categories: Category[];
	patternsMapByCategory: { [ key: string ]: Pattern[] };
}

const ScreenMain = ( {
	onMainItemSelect,
	recordTracksEvent,
	surveyDismissed,
	setSurveyDismissed,
	selectedSections,
	selectedHeader,
	selectedFooter,
	categories,
	patternsMapByCategory,
}: Props ) => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const { location, params, goTo, goBack } = useNavigator();
	const navigatorOptions = { replace: ! location.isInitial };
	const isInitialLocation = location.isInitial && ! location.isBack;
	const selectedCategory = params.categorySlug as string;
	const shouldOpenCategoryList =
		!! selectedCategory && selectedCategory !== 'header' && selectedCategory !== 'footer';
	const isButtonDisabled = ! selectedHeader && ! selectedFooter && ! selectedSections.length;

	const handleClick = () => {
		if ( ! isButtonDisabled ) {
			goTo( NAVIGATOR_PATHS.STYLES );
			recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_CONTINUE_CLICK, {
				screen_from: 'main',
				screen_to: 'styles',
			} );
		}
	};

	const handleNavigatorItemSelect = ( type: string, category: string ) => {
		onMainItemSelect( type );
		if (
			category === selectedCategory ||
			( shouldOpenCategoryList && category === CATEGORY_ALL_SLUG )
		) {
			goBack();
		} else {
			goTo( `/main/${ category }`, navigatorOptions );
		}
	};

	const onSelectSectionCategory = ( category: string ) => {
		goTo( `/main/${ category }`, navigatorOptions );
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.CATEGORY_LIST_CATEGORY_CLICK, {
			pattern_category: replaceCategoryAllName( category ),
		} );
	};

	useEffect( () => {
		if ( ! isInitialLocation || ! wrapperRef.current ) {
			return;
		}

		const activeElement = wrapperRef.current.ownerDocument.activeElement;
		if ( wrapperRef.current.contains( activeElement ) ) {
			return;
		}

		const firstTabbable = ( focus.tabbable.find( wrapperRef.current ) as HTMLElement[] )[ 0 ];
		const elementToFocus = firstTabbable ?? wrapperRef.current;
		elementToFocus.focus();
	}, [ isInitialLocation ] );

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ translate( 'Design your own' ) } /> }
				description={ translate(
					'Create your homepage by first adding patterns and then choosing a color palette and font style.'
				) }
				hideBack
			/>
			<div className="screen-container__body" ref={ wrapperRef }>
				<VStack spacing="4">
					<NavigatorItemGroup title={ translate( 'Patterns' ) }>
						<NavigatorItem
							checked={ Boolean( selectedHeader ) }
							icon={ header }
							aria-label={ translate( 'Header' ) }
							onClick={ () => handleNavigatorItemSelect( 'header', 'header' ) }
							active={ location.path === NAVIGATOR_PATHS.HEADER }
						>
							{ translate( 'Header' ) }
						</NavigatorItem>
						<NavigatorItem
							checked={ Boolean( selectedSections.length ) }
							icon={ layout }
							aria-label={ translate( 'Sections' ) }
							onClick={ () => handleNavigatorItemSelect( 'section', CATEGORY_ALL_SLUG ) }
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
							checked={ Boolean( selectedFooter ) }
							icon={ footer }
							aria-label={ translate( 'Footer' ) }
							onClick={ () => handleNavigatorItemSelect( 'footer', 'footer' ) }
							active={ location.path === NAVIGATOR_PATHS.FOOTER }
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
					aria-disabled={ isButtonDisabled }
					onClick={ handleClick }
					label="Add your first pattern to get started."
					showTooltip={ isButtonDisabled }
					variant="primary"
				>
					{ isEnglishLocale || i18n.hasTranslation( 'Pick your style' )
						? translate( 'Pick your style' )
						: translate( 'Save and continue' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenMain;
