/**
 * External dependencies
 */
import React, { useCallback, useState } from 'react';
import { useI18n } from '@automattic/react-i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { useHistory } from 'react-router-dom';

/**
 * Internal dependencies
 */
import Preview from './preview';
import ViewportSelect from './viewport-select';
import FontSelect from './font-select';
import { Title, SubTitle } from '../../components/titles';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { PLANS_STORE } from '../../stores/plans';
import { USER_STORE } from '../../stores/user';
import { useFreeDomainSuggestion } from '../../hooks/use-free-domain-suggestion';
import { useTrackStep } from '../../hooks/use-track-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import SignupForm from '../../components/signup-form';
import { useShouldSiteBePublicOnSelectedPlan } from '../../hooks/use-selected-plan';
import ActionButtons, { BackButton, NextButton } from '../../components/action-buttons';
import type { Viewport } from './types';

/**
 * Style dependencies
 */
import './style.scss';

const StylePreview: React.FunctionComponent = () => {
	const { getSelectedFonts } = useSelect( ( select ) => select( ONBOARD_STORE ) );
	const { selectedDesign, hasUsedPlansStep } = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getState()
	);

	const shouldSiteBePublic = useShouldSiteBePublicOnSelectedPlan();

	const [ showSignupDialog, setShowSignupDialog ] = useState( false );

	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );

	const hasSelectedDesign = !! selectedDesign;

	const { __ } = useI18n();
	const history = useHistory();
	const { previousStepPath, nextStepPath } = useStepNavigation();

	const [ selectedViewport, setSelectedViewport ] = React.useState< Viewport >( 'desktop' );

	const { createSite } = useDispatch( ONBOARD_STORE );

	const freeDomainSuggestion = useFreeDomainSuggestion();

	const selectedPlan = useSelect( ( select ) => select( PLANS_STORE ).getSelectedPlan() );

	useTrackStep( 'Style', () => ( {
		selected_heading_font: getSelectedFonts()?.headings,
		selected_body_font: getSelectedFonts()?.base,
	} ) );

	const handleSignup = () => {
		setShowSignupDialog( true );
	};

	const closeAuthDialog = () => {
		setShowSignupDialog( false );
	};

	const handleCreateSite = useCallback(
		( username: string, bearerToken?: string ) => {
			createSite( username, freeDomainSuggestion, bearerToken, shouldSiteBePublic );
		},
		[ createSite, freeDomainSuggestion, shouldSiteBePublic ]
	);

	const handleContinue = () => {
		// Skip the plans step if the user has used the plans modal to select a plan
		// If a user has already used the plans step and then gone back, show them the plans step again
		// to avoid confusion
		if ( ! selectedPlan || hasUsedPlansStep ) {
			history.push( nextStepPath );
			return;
		}

		currentUser ? handleCreateSite( currentUser.username ) : handleSignup();
	};

	const handleBack = () => {
		history.push( previousStepPath );
	};

	return (
		<>
			<div className="gutenboarding-page style-preview">
				<div className="style-preview__header">
					<div className="style-preview__titles">
						<Title>{ __( 'Pick a font pairing' ) }</Title>
						<SubTitle>
							{ __( 'Customize your design with typography. You can always fine-tune it later.' ) }
						</SubTitle>
					</div>
					<ViewportSelect selected={ selectedViewport } onSelect={ setSelectedViewport } />
					<ActionButtons className="style-preview__actions">
						<BackButton onClick={ handleBack } />
						{ hasSelectedDesign && <NextButton onClick={ handleContinue } /> }
					</ActionButtons>
				</div>
				<div className="style-preview__content">
					<FontSelect />
					<Preview viewport={ selectedViewport } />
				</div>
				{ showSignupDialog && <SignupForm onRequestClose={ closeAuthDialog } /> }
			</div>
		</>
	);
};

export default StylePreview;
