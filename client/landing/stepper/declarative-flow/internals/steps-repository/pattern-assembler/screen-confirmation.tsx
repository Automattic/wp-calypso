import { Button } from '@automattic/components';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { NavigatorHeader } from '@automattic/onboarding';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { Icon, image, verse, layout } from '@wordpress/icons';
import i18n, { useTranslate } from 'i18n-calypso';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import NavigatorTitle from './navigator-title';
import './screen-confirmation.scss';

interface Props {
	onConfirm: () => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
}

const ScreenConfirmation = ( { onConfirm, recordTracksEvent }: Props ) => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();

	const list = [
		{
			icon: image,
			title: translate( 'Upload images' ),
			description:
				isEnglishLocale || i18n.hasTranslation( 'Showcase your photos in their best light.' )
					? translate( 'Showcase your photos in their best light.' )
					: null,
		},
		{
			icon: verse,
			title: translate( 'Start writing' ),
			description:
				isEnglishLocale || i18n.hasTranslation( 'Get things going and share your insights.' )
					? translate( 'Get things going and share your insights.' )
					: null,
		},
		{
			icon: layout,
			title:
				isEnglishLocale || i18n.hasTranslation( 'Customize every detail' )
					? translate( 'Customize every detail' )
					: translate( 'Customize in editor' ),
			description:
				isEnglishLocale || i18n.hasTranslation( 'Make your site even more unique.' )
					? translate( 'Make your site even more unique.' )
					: null,
		},
	];

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ translate( 'Great job!' ) } /> }
				description={
					isEnglishLocale ||
					i18n.hasTranslation( 'Time to add some content and bring your site to life!' )
						? translate( 'Time to add some content and bring your site to life!' )
						: translate( 'Bring your site to life with some content.' )
				}
				onBack={ () => {
					recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_BACK_CLICK, {
						screen_from: 'confirmation',
						screen_to: 'styles',
					} );
				} }
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
			</div>
			<div className="screen-container__footer">
				<Button className="pattern-assembler__button" primary onClick={ onConfirm }>
					{ isEnglishLocale || i18n.hasTranslation( 'Start adding content' )
						? translate( 'Start adding content' )
						: translate( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenConfirmation;
