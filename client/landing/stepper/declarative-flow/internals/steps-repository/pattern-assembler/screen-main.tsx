import { NavigatorHeader, NavigatorItem, NavigatorItemGroup } from '@automattic/onboarding';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { header, footer } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { NAVIGATOR_PATHS } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import { useScreen, usePatternCountMapByCategory } from './hooks';
import NavigatorTitle from './navigator-title';
import PatternCategoryList from './pattern-category-list';
import PatternCount from './pattern-count';
import { Category, Pattern, PatternType } from './types';

interface Props {
	onMainItemSelect: ( name: string ) => void;
	hasHeader: boolean;
	hasFooter: boolean;
	sections: Pattern[];
	categories: Category[];
	patternsMapByCategory: Record< string, Pattern[] >;
	onContinueClick: () => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
}

const ScreenMain = ( {
	onMainItemSelect,
	hasHeader,
	hasFooter,
	sections,
	categories,
	patternsMapByCategory,
	onContinueClick,
	recordTracksEvent,
}: Props ) => {
	const translate = useTranslate();
	const { title, description, continueLabel } = useScreen( 'main' );
	const { location, params, goTo } = useNavigator();
	const patternCountMapByCategory = usePatternCountMapByCategory( sections );
	const selectedCategory = params.categorySlug as string;
	const totalPatternCount = Number( hasHeader ) + sections.length + Number( hasFooter );
	const isButtonDisabled = totalPatternCount === 0;

	const handleSelectCategory = ( category: string, type: PatternType = 'section' ) => {
		const basePath = NAVIGATOR_PATHS.MAIN;
		const isBack = category === selectedCategory;
		const nextPath = ! isBack ? `${ basePath }/${ category }` : basePath;
		goTo( nextPath, { replace: true } );

		if ( ! isBack ) {
			recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.CATEGORY_LIST_CATEGORY_CLICK, {
				pattern_category: category,
			} );

			if ( type !== 'section' ) {
				onMainItemSelect( type );
			}
		}
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
					<NavigatorItemGroup title={ translate( 'Patterns' ) }>
						<NavigatorItem
							icon={ header }
							aria-label={ translate( 'Header' ) }
							onClick={ () => handleSelectCategory( 'header', 'header' ) }
							active={ location.path === NAVIGATOR_PATHS.MAIN_HEADER }
						>
							<>
								{ translate( 'Header' ) }
								<PatternCount count={ Number( hasHeader ) } />
							</>
						</NavigatorItem>

						<VStack spacing="4">
							<PatternCategoryList
								categories={ categories }
								patternsMapByCategory={ patternsMapByCategory }
								patternCountMapByCategory={ patternCountMapByCategory }
								selectedCategory={ selectedCategory }
								onSelectCategory={ handleSelectCategory }
							/>
						</VStack>

						<NavigatorItem
							icon={ footer }
							aria-label={ translate( 'Footer' ) }
							onClick={ () => handleSelectCategory( 'footer', 'footer' ) }
							active={ location.path === NAVIGATOR_PATHS.MAIN_FOOTER }
						>
							<>
								{ translate( 'Footer' ) }
								<PatternCount count={ Number( hasFooter ) } />
							</>
						</NavigatorItem>
					</NavigatorItemGroup>
				</VStack>
			</div>
			<div className="screen-container__footer">
				<span className="screen-container__footer-description">
					{ totalPatternCount > 0 &&
						translate(
							'You’ve selected {{strong}}%(count)s{{/strong}} pattern.',
							'You’ve selected {{strong}}%(count)s{{/strong}} patterns.',
							{
								count: totalPatternCount,
								args: {
									count: totalPatternCount,
								},
								components: {
									strong: <strong />,
								},
							}
						) }
				</span>
				<Button
					className="pattern-assembler__button"
					disabled={ isButtonDisabled }
					showTooltip={ isButtonDisabled }
					onClick={ onContinueClick }
					label={
						isButtonDisabled
							? translate( 'Select your first pattern to get started.' )
							: continueLabel
					}
					variant="primary"
					text={ continueLabel }
					__experimentalIsFocusable
				/>
			</div>
		</>
	);
};

export default ScreenMain;
