import { Button } from '@automattic/components';
import { NavigatorHeader } from '@automattic/onboarding';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { Icon, image, verse, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import NavigatorTitle from './navigator-title';
import './screen-confirmation.scss';

interface Props {
	onConfirm: () => void;
}

const ScreenConfirmation = ( { onConfirm }: Props ) => {
	const translate = useTranslate();
	const { goBack } = useNavigator();

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ translate( 'Great job!' ) } /> }
				description={ translate( 'Prepare to bring your site to life with your unique content.' ) }
				onBack={ () => {
					goBack();
					// @TODO: Track back event
				} }
			/>
			<div className="screen-container__body">
				<VStack spacing="4" className="screen-confirmation__list">
					<HStack spacing="4" alignment="top">
						<div className="screen-confirmation__list-item-icon">
							<Icon icon={ image } size={ 18.6 } />
						</div>
						<VStack spacing="1" className="screen-confirmation__list-item-wrapper">
							<strong className="screen-confirmation__list-item-title">
								{ translate( 'Upload your photos' ) }
							</strong>
							<p className="screen-confirmation__list-item-description">
								{ /* @TODO: Update copy */ }
								{ translate( 'Morbi pellentesque mauris eget laoreet.' ) }
							</p>
						</VStack>
					</HStack>
					<HStack spacing="4" alignment="top">
						<div className="screen-confirmation__list-item-icon">
							<Icon icon={ verse } size={ 18.6 } />
						</div>
						<VStack spacing="1" className="screen-confirmation__list-item-wrapper">
							<strong className="screen-confirmation__list-item-title">
								{ translate( 'Write your content' ) }
							</strong>
							<p className="screen-confirmation__list-item-description">
								{ /* @TODO: Update copy */ }
								{ translate( 'Morbi pellentesque mauris eget laoreet.' ) }
							</p>
						</VStack>
					</HStack>
					<HStack spacing="4" alignment="top">
						<div className="screen-confirmation__list-item-icon">
							<Icon icon={ layout } size={ 18.6 } />
						</div>
						<VStack spacing="1" className="screen-confirmation__list-item-wrapper">
							<strong className="screen-confirmation__list-item-title">
								{ translate( 'Customize every detail' ) }
							</strong>
							<p className="screen-confirmation__list-item-description">
								{ /* @TODO: Update copy */ }
								{ translate( 'Morbi pellentesque mauris eget laoreet.' ) }
							</p>
						</VStack>
					</HStack>
				</VStack>
			</div>
			<div className="screen-container__footer">
				<Button className="pattern-assembler__button" primary onClick={ onConfirm }>
					{ translate( 'Ready to add content' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenConfirmation;
