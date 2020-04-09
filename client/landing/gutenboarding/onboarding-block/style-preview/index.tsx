/**
 * External dependencies
 */
import React, { useCallback, useState } from 'react';
import { useI18n } from '@automattic/react-i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Preview from './preview';
import Link from '../../components/link';
import { usePath, Step } from '../../path';
import ViewportSelect from './viewport-select';
import FontSelect from './font-select';
import { Title, SubTitle } from '../../components/titles';
import * as T from './types';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { USER_STORE } from '../../stores/user';
import { useFreeDomainSuggestion } from '../../hooks/use-free-domain-suggestion';
import SignupForm from '../../components/signup-form';

import './style.scss';

const StylePreview: React.FunctionComponent = () => {
	const { selectedDesign } = useSelect( select => select( ONBOARD_STORE ).getState() );

	const [ showSignupDialog, setShowSignupDialog ] = useState( false );

	const currentUser = useSelect( select => select( USER_STORE ).getCurrentUser() );

	const hasSelectedDesign = !! selectedDesign;

	const { __ } = useI18n();
	const makePath = usePath();
	const [ selectedViewport, setSelectedViewport ] = React.useState< T.Viewport >( 'desktop' );

	const { createSite } = useDispatch( ONBOARD_STORE );

	const freeDomainSuggestion = useFreeDomainSuggestion();

	const handleSignup = () => {
		setShowSignupDialog( true );
	};

	const closeAuthDialog = () => {
		setShowSignupDialog( false );
	};

	const handleCreateSite = useCallback(
		( username: string, bearerToken?: string ) => {
			createSite( username, freeDomainSuggestion, bearerToken );
		},
		[ createSite, freeDomainSuggestion ]
	);

	return (
		<div className="gutenboarding-page style-preview">
			<div className="style-preview__header">
				<div className="style-preview__titles">
					<Title>{ __( 'Select your fonts' ) }</Title>
					<SubTitle>{ __( 'Add some personality to your design.' ) }</SubTitle>
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
							onClick={ () =>
								currentUser ? handleCreateSite( currentUser.username ) : handleSignup()
							}
						>
							{ __( 'Continue' ) }
						</Button>
					) }
				</div>
			</div>
			<div className="style-preview__content">
				<FontSelect />
				<Preview viewport={ selectedViewport } />
				<div className="style-preview__actions-mobile">
					{ hasSelectedDesign && (
						<Button
							className="style-preview__actions-mobile-continue-button"
							isPrimary
							isLarge
							onClick={ () =>
								currentUser ? handleCreateSite( currentUser.username ) : handleSignup()
							}
						>
							{ __( 'Continue' ) }
						</Button>
					) }
					<Link isLink to={ makePath( Step.DesignSelection ) }>
						{ __( 'Choose another design' ) }
					</Link>
				</div>
			</div>
			{ showSignupDialog && <SignupForm onRequestClose={ closeAuthDialog } /> }
		</div>
	);
};

export default StylePreview;
