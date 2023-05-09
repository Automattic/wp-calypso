/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { useState, useRef, useEffect } from 'react';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import usePodcastTitle from 'calypso/landing/stepper/hooks/use-podcast-title';
import { ONBOARD_STORE, USER_STORE } from 'calypso/landing/stepper/stores';
import getTextWidth from 'calypso/landing/stepper/utils/get-text-width';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tip } from 'calypso/signup/icons';
import type { Step } from '../../types';
import type { OnboardSelect, UserSelect } from '@automattic/data-stores';
import './style.scss';

const PodcastTitleStep: Step = function PodcastTitleStep( { navigation } ) {
	const { goBack, submit, goToStep } = navigation;
	const { __ } = useI18n();

	const PodcastTitleForm: React.FC = () => {
		//Get the podcast title from the API
		const podcastTitle = usePodcastTitle();
		const { siteTitle } = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getState(),
			[]
		);
		const currentUser = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
			[]
		);
		const newUser = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).getNewUser(),
			[]
		);
		const hasSiteTitle = siteTitle.length > 0;
		const { setSiteTitle } = useDispatch( ONBOARD_STORE );
		const [ formTouched, setFormTouched ] = useState( false );

		useEffect( () => {
			if ( ! currentUser && ! newUser ) {
				//Go to login
				goToStep?.( 'login' );
			}
		}, [ currentUser, newUser ] );

		/*
		 * If we don't have a custom title in the store and we haven't touched the form input,
		 * use the podcast title from the API
		 */
		useEffect( () => {
			if ( podcastTitle && ! hasSiteTitle && ! formTouched ) {
				// Set initial site title to podcast title
				setSiteTitle( podcastTitle );
			}
		}, [ setSiteTitle, hasSiteTitle, podcastTitle ] );

		const inputRef = useRef< HTMLInputElement >();
		const underlineWidth = getTextWidth( ( siteTitle as string ) || '', inputRef.current );

		const handleSubmit = ( siteTitle: string ) => {
			const providedDependencies = {
				siteTitle,
			};
			setSiteTitle( siteTitle );
			submit?.( providedDependencies );
		};

		const handleChange = ( event: React.FormEvent< HTMLInputElement > ) => {
			setFormTouched( true );
			setSiteTitle( event.currentTarget.value );
		};

		return (
			<form
				className="podcast-title__form"
				onSubmit={ () => {
					handleSubmit?.( siteTitle );
				} }
			>
				<div
					className={ classNames( 'podcast-title__input-wrapper', { 'is-touched': formTouched } ) }
				>
					<FormLabel htmlFor="podcast-title">{ __( 'My podcast is called' ) }</FormLabel>
					<div className="podcast-title__explanation">
						<FormInput
							id="podcast-title"
							inputRef={ inputRef }
							value={ siteTitle }
							onChange={ handleChange }
							placeholder="At the Fork"
						/>
						<div
							className={ classNames( 'podcast-title__underline', {
								'is-empty': ! ( siteTitle as string )?.length,
							} ) }
							style={ { width: underlineWidth || '100%' } }
						/>
						<FormSettingExplanation>
							<Icon className="podcast-title__form-icon" icon={ tip } size={ 20 } />
							{ __( "Don't worry, you can change it later." ) }
						</FormSettingExplanation>
					</div>
				</div>
				<Button className="podcast-title__submit-button" type="submit" primary>
					{ __( 'Continue' ) }
				</Button>
			</form>
		);
	};

	return (
		<StepContainer
			stepName="podcast-title-step"
			goBack={ goBack }
			hideBack
			isFullLayout
			stepContent={ <PodcastTitleForm /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PodcastTitleStep;
