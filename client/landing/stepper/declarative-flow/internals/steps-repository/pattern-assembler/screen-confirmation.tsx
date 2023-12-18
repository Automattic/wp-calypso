import { Button } from '@automattic/components';
import { Design } from '@automattic/design-picker';
import { localizeUrl } from '@automattic/i18n-utils';
import { NavigatorHeader } from '@automattic/onboarding';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { Icon, image, layout, home, verse } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { IAppState } from 'calypso/state/types';
import { useScreen } from './hooks';
import NavigatorTitle from './navigator-title';
import './screen-confirmation.scss';

interface Props {
	siteId?: number;
	isNewSite: boolean;
	selectedDesign?: Design;
	onConfirm: () => void;
}

const ScreenConfirmation = ( { siteId = 0, isNewSite, selectedDesign, onConfirm }: Props ) => {
	const translate = useTranslate();
	const { title } = useScreen( 'confirmation' );

	const currentThemeId = useSelector( ( state: IAppState ) => getActiveTheme( state, siteId ) );
	const currentTheme = useSelector( ( state: IAppState ) =>
		getCanonicalTheme( state, siteId, currentThemeId )
	);
	const willThemeChange = currentThemeId !== selectedDesign?.slug;

	let description;
	let list;
	let continueLabel;

	if ( isNewSite ) {
		description = translate( 'Time to add some content and bring your site to life!' );
		list = [
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
		continueLabel = translate( 'Start adding content' );
	} else if ( willThemeChange ) {
		description = translate( 'The following will change in your site.' );
		list = [
			{
				icon: layout,
				title: translate( 'Active theme' ),
				description: translate(
					'This will change your active theme from %(oldThemeName)s to {{strong}}%(newThemeName)s{{/strong}}.',
					{
						components: {
							strong: <strong />,
						},
						args: {
							oldThemeName: currentTheme?.name ?? '',
							newThemeName: selectedDesign?.title ?? '',
						},
					}
				),
			},
			{
				icon: home,
				title: translate( 'Homepage' ),
				description: translate(
					'This will replace your homepage, but your content will remain accessible. {{a}}Learn more{{/a}}.',
					{
						components: {
							a: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/themes/changing-themes' ) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				),
			},
		];
		continueLabel = translate( 'Confirm' );
	} else {
		description = translate( 'You can further customize your site in the Site Editor.' );
		list = [] as any[];
		continueLabel = translate( 'Confirm' );
	}

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ title } /> }
				description={ description }
				hideBack
			/>
			<QueryActiveTheme siteId={ siteId } />
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
