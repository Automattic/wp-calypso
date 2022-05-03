/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { useState, useRef } from 'react';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import getTextWidth from 'calypso/landing/gutenboarding/onboarding-block/acquire-intent/get-text-width';
import useDetectMatchingAnchorSite from 'calypso/landing/stepper/hooks/use-detect-matching-anchor-site';
import useSiteTitle from 'calypso/landing/stepper/hooks/use-site-title';
import usePodcastTitle from 'calypso/landing/stepper/hooks/use-podcast-title';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tip } from 'calypso/signup/icons';
import type { Step } from '../../types';
import './style.scss';

const PodcastTitleStep: Step = function PodcastTitleStep( { navigation } ) {
	const { goBack, submit } = navigation;
	const { __ } = useI18n();

	//Check to see if there is a site with a matching anchor podcast ID
	const isLookingUpMatchingAnchorSites = useDetectMatchingAnchorSite();

	const PodcastTitleForm: React.FC = () => {
		//Sets the site title from the API on first load if a custom title has not been set
		useSiteTitle();
		const { siteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
		const [ formTouched, setFormTouched ] = useState( false );
		const { setSiteTitle } = useDispatch( ONBOARD_STORE );
		const titleFromApi = usePodcastTitle();
		const podcastTitle = siteTitle ? siteTitle : titleFromApi;
		const inputRef = useRef< HTMLInputElement >();
		const underlineWidth = getTextWidth( ( siteTitle as string ) || '', inputRef.current );

		const handleSubmit = async ( siteTitle: string ) => {
			const providedDependencies = { siteTitle };
			setSiteTitle( siteTitle );
			submit?.( providedDependencies, siteTitle );
		};

		const handleChange = ( event: React.FormEvent< HTMLInputElement > ) => {
			setFormTouched( true );
			setSiteTitle( event.currentTarget.value );
		};

		//If we're still checking for matching Anchor sites, don't show the form
		if ( isLookingUpMatchingAnchorSites ) {
			return <div />;
		}

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
							value={ podcastTitle }
							onChange={ handleChange }
							placeholder="Good Fun"
						/>
						<div
							className={ classNames( 'podcast-title__underline', {
								'is-empty': ! ( podcastTitle as string )?.length,
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
			stepName={ 'podcast-title-step' }
			goBack={ goBack }
			hideBack
			isFullLayout
			stepContent={ <PodcastTitleForm /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PodcastTitleStep;
