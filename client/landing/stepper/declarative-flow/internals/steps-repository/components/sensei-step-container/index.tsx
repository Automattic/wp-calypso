import { SENSEI_FLOW, StepContainer } from '@automattic/onboarding';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { Icon, wordpress } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { Container, TitleContainer, Title, Footer, FooterText } from './components';
import './styles.scss';

interface SenseiStepContainerProps {
	stepName: string;
	recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
	children: React.ReactNode;
	className?: string;
	formattedHeader?: React.ReactNode;
	showFooter?: boolean;
}

export const SenseiStepContainer: React.FC< SenseiStepContainerProps > = ( {
	formattedHeader,
	children,
	showFooter,
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
						<DocumentHead title={ __( 'Course Creator' ) } />
						<Title>{ __( 'Course Creator' ) }</Title>
					</TitleContainer>
					{ formattedHeader && <div className="step-container__header">{ formattedHeader }</div> }
					{ children }
					{ showFooter && (
						<Footer>
							<FooterText>
								{ createInterpolateElement( __( 'Hosted by <a>WordPress.com</a>' ), {
									a: <ExternalLink href="https://wordpress.com" children={ null } />,
								} ) }
							</FooterText>
							<FooterText>
								{ __( 'Course creation and LMS tools powered by SenseiLMS' ) }
							</FooterText>
						</Footer>
					) }
				</Container>
			}
		/>
	);
};
