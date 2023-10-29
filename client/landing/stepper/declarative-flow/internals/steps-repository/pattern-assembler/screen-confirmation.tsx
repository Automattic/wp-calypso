import { Button } from '@automattic/components';
import { NavigatorHeader } from '@automattic/onboarding';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { Icon, image, verse, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useScreen } from './hooks';
import NavigatorTitle from './navigator-title';
import Survey from './survey';
import './screen-confirmation.scss';

interface Props {
	onConfirm: () => void;
	surveyDismissed: boolean;
	setSurveyDismissed: ( dismissed: boolean ) => void;
}

const ScreenConfirmation = ( { onConfirm, surveyDismissed, setSurveyDismissed }: Props ) => {
	const translate = useTranslate();
	const { title, description, continueLabel } = useScreen( 'confirmation' );

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
				{ ! surveyDismissed && (
					<Survey
						eventName="assembler-november-2023"
						eventUrl="https://automattic.survey.fm/assembler-survey-2"
						setSurveyDismissed={ setSurveyDismissed }
					/>
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
