import { Button } from '@automattic/components';
import { Design } from '@automattic/design-picker';
import { NavigatorHeader } from '@automattic/onboarding';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { Icon, image, verse, layout } from '@wordpress/icons';
import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getActiveTheme } from 'calypso/state/themes/selectors';
import { useScreen } from './hooks';
import NavigatorTitle from './navigator-title';
import Survey from './survey';
import type { IAppState } from 'calypso/state/types';
import './screen-confirmation.scss';

interface Props {
	isNewSite: boolean;
	siteId?: number;
	selectedDesign?: Design;
	surveyDismissed: boolean;
	setSurveyDismissed: ( dismissed: boolean ) => void;
	onConfirm: () => void;
}

const ScreenConfirmation = ( {
	isNewSite,
	siteId = 0,
	selectedDesign,
	surveyDismissed,
	setSurveyDismissed,
	onConfirm,
}: Props ) => {
	const translate = useTranslate();
	const { title, continueLabel } = useScreen( 'confirmation' );

	const currentThemeId = useSelector( ( state: IAppState ) => getActiveTheme( state, siteId ) );
	const willThemeChange = currentThemeId !== selectedDesign?.slug;
	const isEnglishLocale = getLocaleSlug()?.startsWith( 'en' );

	const description =
		currentThemeId && willThemeChange && ! isNewSite
			? translate(
					'Your new theme is %(newThemeName)s. Time to add some content and bring your site to life!',
					{
						args: {
							newThemeName: selectedDesign?.title ?? '',
						},
					}
			  )
			: translate( 'Time to add some content and bring your site to life!' );

	const list = [
		{
			icon: image,
			title: translate( 'Upload images' ),
			description: translate( 'Showcase your photos in their best light.' ),
		},
		{
			icon: verse,
			title: translate( 'Start writing' ),
			description: translate( 'Get things going and share your insights.' ),
		},
		{
			icon: layout,
			title: translate( 'Customize every detail' ),
			description: translate( 'Make your site even more unique.' ),
		},
	];

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ title } /> }
				description={ description }
				hideBack
			/>
			<div className="screen-container__body">
				<VStack spacing="4" className="screen-confirmation__list">
					{ list.map( ( { icon, title, description } ) => (
						<HStack spacing="4" alignment="top" key={ title }>
							<div className="screen-confirmation__list-item-icon">
								<Icon icon={ icon } size={ 18.6 } />
							</div>
							<VStack spacing="1" className="screen-confirmation__list-item-wrapper">
								<strong className="screen-confirmation__list-item-title">{ title }</strong>
								<p className="screen-confirmation__list-item-description">{ description }</p>
							</VStack>
						</HStack>
					) ) }
				</VStack>
				{ ! surveyDismissed && isEnglishLocale && (
					<Survey setSurveyDismissed={ setSurveyDismissed } />
				) }
			</div>
			<div className="screen-container__footer">
				<Button className="pattern-assembler__button" primary onClick={ onConfirm }>
					{ continueLabel }
				</Button>
			</div>
		</>
	);
};

export default ScreenConfirmation;
