import { Icon, wordpress } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { Container, TitleContainer, Title } from './components';
import './styles.scss';

export const SenseiStepContent: React.FC< { children: React.ReactNode } > = ( { children } ) => {
	const { __ } = useI18n();
	return (
		<Container>
			<TitleContainer>
				<Icon icon={ wordpress } />
				<Title>{ __( 'Course Creator' ) }</Title>
			</TitleContainer>
			{ children }
		</Container>
	);
};
