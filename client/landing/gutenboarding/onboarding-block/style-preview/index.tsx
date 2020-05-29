/**
 * External dependencies
 */
import React, { useCallback, useState } from 'react';
import { useI18n } from '@automattic/react-i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { useHistory } from 'react-router-dom';

/**
 * Internal dependencies
 */
import Preview from './preview';
import Link from '../../components/link';
import { usePath, Step } from '../../path';
import ViewportSelect from './viewport-select';
import FontSelect from './font-select';
import { Title, SubTitle } from '../../components/titles';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { Plans } from '@automattic/data-stores';
import { USER_STORE } from '../../stores/user';
import { useFreeDomainSuggestion } from '../../hooks/use-free-domain-suggestion';
import SignupForm from '../../components/signup-form';
import { useTrackStep } from '../../hooks/use-track-step';
import { useShouldSiteBePublicOnSelectedPlan } from '../../hooks/use-selected-plan';
import BottomBarMobile from '../../components/bottom-bar-mobile';
import type { Viewport } from './types';

import './style.scss';

const PLANS_STORE = Plans.STORE_KEY;

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
	const makePath = usePath();
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
			history.push( makePath( Step.Plans ) );
			return;
		}

		currentUser ? handleCreateSite( currentUser.username ) : handleSignup();
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
					<div className="style-preview__actions">
						<Link isLink to={ makePath( Step.DesignSelection ) }>
							{ __( 'Choose another design' ) }
						</Link>
						{ hasSelectedDesign && (
							<Button
								className="style-preview__actions-continue-button"
								isPrimary
								isLarge
								onClick={ handleContinue }
							>
								{ __( 'Continue' ) }
							</Button>
						) }
					</div>
				</div>
				<div className="style-preview__content">
					<FontSelect />
					<Preview viewport={ selectedViewport } />
				</div>
				{ showSignupDialog && <SignupForm onRequestClose={ closeAuthDialog } /> }
			</div>
			<BottomBarMobile backUrl={ makePath( Step.DesignSelection ) } onContinue={ handleContinue } />
		</>
	);
};

export default StylePreview;
