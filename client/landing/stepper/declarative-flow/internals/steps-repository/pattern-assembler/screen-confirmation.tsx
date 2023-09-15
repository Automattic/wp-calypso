import { Button } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { NavigatorHeader } from '@automattic/onboarding';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { Icon, image, verse, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useScreen } from './hooks';
import NavigatorTitle from './navigator-title';
import './screen-confirmation.scss';

interface Props {
	onConfirm: () => void;
}

const ScreenConfirmation = ( { onConfirm }: Props ) => {
	const translate = useTranslate();
	const { title, description, continueLabel } = useScreen( 'confirmation' );
	const hasEnTranslation = useHasEnTranslation();

	const list = [
		{
			icon: image,
			title: translate( 'Upload images' ),
			description: hasEnTranslation( 'Showcase your photos in their best light.' )
				? translate( 'Showcase your photos in their best light.' )
				: null,
		},
		{
			icon: verse,
			title: translate( 'Start writing' ),
			description: hasEnTranslation( 'Get things going and share your insights.' )
				? translate( 'Get things going and share your insights.' )
				: null,
		},
		{
			icon: layout,
			title: hasEnTranslation( 'Customize every detail' )
				? translate( 'Customize every detail' )
				: translate( 'Customize in editor' ),
			description: hasEnTranslation( 'Make your site even more unique.' )
				? translate( 'Make your site even more unique.' )
				: null,
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
