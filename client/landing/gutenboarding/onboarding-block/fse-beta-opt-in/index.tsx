import {
	Title,
	SubTitle,
	ActionButtons,
	NextButton,
	BackButton,
	SkipButton,
} from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { Icon, siteLogo, header, navigation, arrowRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import useStepNavigation from '../../hooks/use-step-navigation';
import { useTrackStep } from '../../hooks/use-track-step';
import { trackEventWithFlow } from '../../lib/analytics';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import type { FunctionComponent } from 'react';

import './style.scss';

const FseBetaOptIn: FunctionComponent = () => {
	const { __ } = useI18n();
	const { goNext, goBack } = useStepNavigation();
	const { enrollInFseBeta } = useDispatch( ONBOARD_STORE );
	const { isEnrollingInFseBeta } = useSelect( ( select ) => select( ONBOARD_STORE ) );
	const pickBeta = ( shouldEnroll: boolean ) => {
		enrollInFseBeta( shouldEnroll );
		trackEventWithFlow( 'calypso_fse_beta_opt_in', {
			selected_fse_beta_opt_in: shouldEnroll,
		} );
		goNext();
	};

	useTrackStep( 'FseBetaOptIn', () => ( {
		selected_fse_beta_opt_in: isEnrollingInFseBeta(),
	} ) );

	return (
		<div className="gutenboarding-page fse-beta-opt-in">
			<div className="fse-beta-opt-in__header">
				<div>
					<Title>{ __( 'Join Our Full Site Editing Beta' ) }</Title>
					<SubTitle>{ __( 'Experience the new WordPress.com site editing features' ) }</SubTitle>
				</div>
				<ActionButtons className="fse-beta-opt-in__actions">
					<BackButton onClick={ goBack } />
					<SkipButton onClick={ () => pickBeta( false ) } />
				</ActionButtons>
			</div>
			<div className="fse-beta-opt-in__content">
				<ol>
					<li>
						<Icon icon={ siteLogo } />
						<h3>{ __( 'Edit Your Logo' ) }</h3>
						<p>
							{ __(
								'Change and update your logo and other header elements without leaving the editor'
							) }
						</p>
					</li>
					<li>
						<Icon icon={ header } />
						<h3>{ __( 'Update Your Header and Footer' ) }</h3>
						<p>
							{ __(
								'Full Site Editing allows you to make changes on your site header and footer.'
							) }
						</p>
					</li>
					<li>
						<Icon icon={ navigation } />
						<h3>{ __( 'Build Your Navigation' ) }</h3>
						<p>{ __( 'Take your site menus to the next level by adding blocks to it.' ) }</p>
					</li>
				</ol>

				<NextButton className="fse-beta-opt-in__submit" onClick={ () => pickBeta( true ) }>
					{ __( 'Enroll in Beta' ) }
					<Icon icon={ arrowRight } />
				</NextButton>
			</div>
		</div>
	);
};

export default FseBetaOptIn;
