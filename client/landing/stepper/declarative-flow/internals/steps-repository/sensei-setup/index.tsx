import { StepContainer, SENSEI_FLOW, SenseiStepContent } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE } from '../../../../stores';
import { Title, Label, Input, Button } from './components';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';

const SenseiSetupStep: Step = ( { navigation } ) => {
	const { __ } = useI18n();

	const initialSiteTitle = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getSelectedSiteTitle()
	);
	const [ siteTitle, setSiteTitle ] = useState< string >( initialSiteTitle );

	const { submit } = navigation;
	const dispatch = useDispatch( ONBOARD_STORE );
	const handleSubmit = useCallback( () => {
		dispatch.setSiteTitle( siteTitle );
		if ( submit ) {
			submit();
		}
	}, [ siteTitle, dispatch, submit ] );

	return (
		<StepContainer
			stepName="senseiSetup"
			flowName={ SENSEI_FLOW }
			isWideLayout
			hideFormattedHeader
			recordTracksEvent={ recordTracksEvent }
			shouldHideNavButtons
			stepContent={
				<SenseiStepContent>
					<Title>{ __( 'Set up your course site' ) }</Title>
					<Label htmlFor="sensei_site_title">{ __( 'Site name' ) }</Label>
					<Input
						id="sensei_site_title"
						type="text"
						onChange={ ( ev ) => {
							setSiteTitle( ev.target.value );
						} }
						placeholder={ __( 'My Site Name' ) }
						value={ siteTitle }
					/>
					<Button disabled={ ! siteTitle } onClick={ handleSubmit }>
						{ __( 'Continue' ) }
					</Button>
				</SenseiStepContent>
			}
		/>
	);
};

export default SenseiSetupStep;
