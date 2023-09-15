import { NavigatorHeader, NavigatorItem, NavigatorItemGroup } from '@automattic/onboarding';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { header, footer, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { NAVIGATOR_PATHS, INITIAL_CATEGORY } from './constants';
import { useScreen } from './hooks';
import NavigatorTitle from './navigator-title';
import Survey from './survey';
import { PatternType } from './types';

interface Props {
	onMainItemSelect: ( name: string ) => void;
	surveyDismissed: boolean;
	setSurveyDismissed: ( dismissed: boolean ) => void;
	hasSections: boolean;
	hasHeader: boolean;
	hasFooter: boolean;
	onContinueClick: () => void;
}

const ScreenMain = ( {
	onMainItemSelect,
	surveyDismissed,
	setSurveyDismissed,
	hasSections,
	hasHeader,
	hasFooter,
	onContinueClick,
}: Props ) => {
	const translate = useTranslate();
	const { title, description, continueLabel } = useScreen( 'main' );
	const { location, params, goTo } = useNavigator();
	const selectedCategory = params.categorySlug as string;
	const isButtonDisabled = ! hasSections && ! hasHeader && ! hasFooter;

	const handleNavigatorItemSelect = ( type: PatternType, path: string, category: string ) => {
		const nextPath = category !== selectedCategory ? `${ path }/${ category }` : path;
		goTo( nextPath, { replace: true } );
		onMainItemSelect( type );
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
							checked={ hasHeader }
							icon={ header }
							aria-label={ translate( 'Header' ) }
							onClick={ () =>
								handleNavigatorItemSelect( 'header', NAVIGATOR_PATHS.MAIN, 'header' )
							}
							active={ location.path === NAVIGATOR_PATHS.MAIN_HEADER }
						>
							{ translate( 'Header' ) }
						</NavigatorItem>
						<NavigatorItem
							checked={ hasSections }
							icon={ layout }
							aria-label={ translate( 'Sections' ) }
							onClick={ () =>
								handleNavigatorItemSelect( 'section', NAVIGATOR_PATHS.SECTIONS, INITIAL_CATEGORY )
							}
						>
							{ translate( 'Sections' ) }
						</NavigatorItem>

						<NavigatorItem
							checked={ hasFooter }
							icon={ footer }
							aria-label={ translate( 'Footer' ) }
							onClick={ () =>
								handleNavigatorItemSelect( 'footer', NAVIGATOR_PATHS.MAIN, 'footer' )
							}
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
					onClick={ onContinueClick }
					label={
						isButtonDisabled ? translate( 'Add your first pattern to get started.' ) : continueLabel
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
