import { StepContainer, SENSEI_FLOW, SenseiStepContent } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE } from '../../../../stores';
import { Title, Label, Input, Button } from './components';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';

const SenseiSetupStep: Step = ( { navigation } ) => {
	const { __ } = useI18n();

	const [ siteTitle, setSiteTitle ] = useState< string >( '' );

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
					/>
					<Button disabled={ ! siteTitle } onClick={ handleSubmit }>
						{ __( 'Continue' ) }
					</Button>
				</SenseiStepContent>
			}
			hideFormattedHeader
			recordTracksEvent={ recordTracksEvent }
			shouldHideNavButtons
		/>
	);
};

export default SenseiSetupStep;
