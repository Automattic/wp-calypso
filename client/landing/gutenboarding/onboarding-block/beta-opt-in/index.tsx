import { Title, SubTitle, ActionButtons, NextButton, SkipButton } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { Icon, chevronRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import useStepNavigation from '../../hooks/use-step-navigation';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';

import './style.scss';

const BetaOptIn: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const { goNext } = useStepNavigation();
	const { enrollInFseBeta } = useDispatch( ONBOARD_STORE );
	const pickBeta = ( shouldEnroll: boolean ) => {
		enrollInFseBeta( shouldEnroll );
		goNext();
	};
	return (
		<div className="gutenboarding-page beta-opt-in">
			<div className="beta-opt-in__header">
				<Title>{ __( 'Join Our Full Site Editing Beta' ) }</Title>
				<SubTitle>{ __( 'Experience the new WordPress.com site editing features' ) }</SubTitle>
			</div>
			<div className="beta-opt-in__content">
				<div className="beta-opt-in__column">
					<h3>{ __( 'Do it all, right from the editor' ) }</h3>
					<p>
						{ __(
							'The new Full Site Editing-enabled editor allows you to change and update your site with ease.'
						) }
					</p>
				</div>
				<div className="beta-opt-in__column">
					<h3>{ __( 'Style everything' ) }</h3>
					<p>
						{ __(
							'Express yourself with custom typography and color styles at the site, block type, and block level.'
						) }
					</p>
				</div>
			</div>

			<ActionButtons className="beta-opt-in__actions">
				<NextButton onClick={ () => pickBeta( true ) }>
					{ __( 'Enroll in Beta' ) }
					<Icon icon={ chevronRight } />
				</NextButton>
				<SkipButton onClick={ () => pickBeta( false ) }>{ __( 'No Thanks' ) }</SkipButton>
			</ActionButtons>
		</div>
	);
};

export default BetaOptIn;
