import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { Icon, wordpress } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import StepContainer from '../step-container';
import { SENSEI_FLOW } from '../utils';
import { Container, TitleContainer, Title, Footer, FooterText } from './components';
import './styles.scss';

interface SenseiStepContainerProps {
	stepName: string;
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
	children: React.ReactNode;
}

export const SenseiStepContainer: React.FC< SenseiStepContainerProps > = ( {
	children,
	...props
} ) => {
	const { __ } = useI18n();
	return (
		<StepContainer
			flowName={ SENSEI_FLOW }
			isWideLayout
			hideFormattedHeader
			shouldHideNavButtons
			{ ...props }
			stepContent={
				<Container>
					<TitleContainer>
						<Icon icon={ wordpress } />
						<Title>{ __( 'Course Creator' ) }</Title>
					</TitleContainer>
					{ children }
					<Footer>
						<FooterText>
							{ createInterpolateElement( __( 'Hosting with the <a>WordPress.com</a>' ), {
								a: <ExternalLink href="https://wordpress.com" target="_blank" />,
							} ) }
						</FooterText>
						<FooterText>{ __( 'Course creation and LMS tools powered by SenseiLMS' ) }</FooterText>
					</Footer>
				</Container>
			}
		/>
	);
};
