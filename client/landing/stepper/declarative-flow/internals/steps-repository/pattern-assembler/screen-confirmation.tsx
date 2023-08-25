import { Button } from '@automattic/components';
import { NavigatorHeader } from '@automattic/onboarding';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { Icon, image, verse, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import NavigatorTitle from './navigator-title';
import './screen-confirmation.scss';

interface Props {
	onConfirm: () => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
}

const ScreenConfirmation = ( { onConfirm, recordTracksEvent }: Props ) => {
	const translate = useTranslate();

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
				title={ <NavigatorTitle title={ translate( 'Great job!' ) } /> }
				description={ translate( 'Time to add some content and bring your site to life!' ) }
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
					{ translate( 'Start adding content' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenConfirmation;
