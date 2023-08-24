import { StepContainer } from '@automattic/onboarding';
import { TextControl, Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data'; // useDispatch
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent, useEffect, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import PodcastTopicSelector from './podcast-topic-selector';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

const PodcastFeed: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
	const site = useSite();

	// const { setSiteTitle, setSiteDescription } = useDispatch( ONBOARD_STORE );

	// const [ invalidSiteTitle, setInvalidSiteTitle ] = useState( false );
	// const [ siteTitle, setComponentSiteTitle ] = useState( '' );
	// const [ tagline, setTagline ] = useState( '' );
	const [ name, setName ] = useState( '' );
	const state = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] ).getState();

	useEffect( () => {
		// const { siteTitle, siteDescription } = state;
		// setTagline( siteDescription );
		// setComponentSiteTitle( siteTitle );
	}, [ state ] );

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		// setComponentSiteTitle( site.name || '' );
		// setTagline( site.description );
	}, [ site ] );

	const isLoading = false;

	const handleSubmit = ( event: FormEvent ) => {
		event.preventDefault();
		/*
		setInvalidSiteTitle( ! siteTitle.trim().length );

		setSiteDescription( tagline );
		setSiteTitle( siteTitle );

		if ( siteTitle.trim().length ) {
			submit?.( { siteTitle, tagline } );
		}
		*/
		submit?.();
	};

	return (
		<StepContainer
			stepName="podcast-feed"
			isWideLayout={ true }
			hideBack={ true }
			flowName="podcast"
			formattedHeader={
				<FormattedHeader
					id="podcast-feed-header"
					headerText={ __( 'Podcast feed' ) }
					subHeaderText={ __( 'Few more details for your podcast feed.' ) }
					align="center"
				/>
			}
			stepContent={
				<form onSubmit={ handleSubmit }>
					<FormFieldset>
						<FormLabel htmlFor="setup-form-input-name">{ __( 'Your name' ) }</FormLabel>
						<TextControl
							name="setup-form-input-name"
							id="setup-form-input-name"
							value={ name }
							onChange={ ( value ) => setName( value ) }
							placeholder={ __( 'Your name' ) }
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="podcasting_category_1">{ __( 'Podcast Topics' ) }</FormLabel>
						<FormSettingExplanation>
							{ __(
								'Choose how your podcast should be categorized within Apple Podcasts and other podcasting services.'
							) }
						</FormSettingExplanation>
						<PodcastTopicSelector
							fields={ [] }
							handleSelect={ ( event ) => {
								// eslint-disable-next-line no-console
								console.log( 'PodcastTopicSelector', event );
							} }
							category="podcasting_category_1"
						/>
						<br />
						<PodcastTopicSelector
							fields={ [] }
							handleSelect={ ( event ) => {
								// eslint-disable-next-line no-console
								console.log( 'PodcastTopicSelector', event );
							} }
							category="podcasting_category_2"
						/>
						<br />
						<PodcastTopicSelector
							fields={ [] }
							handleSelect={ ( event ) => {
								// eslint-disable-next-line no-console
								console.log( 'PodcastTopicSelector', event );
							} }
							category="podcasting_category_3"
						/>
						<Button
							className="setup-form__submit"
							disabled={ isLoading }
							variant="primary"
							type="submit"
						>
							{ isLoading ? __( 'Loading' ) : __( 'Continue' ) }
						</Button>
					</FormFieldset>
				</form>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PodcastFeed;
