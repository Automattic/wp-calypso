import { StepContainer } from '@automattic/onboarding';
import { TextControl, Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data'; // useDispatch
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent, useEffect, useState, ChangeEvent } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import TopicsSelector from 'calypso/my-sites/site-settings/podcasting-details//topics-selector';
// import PodcastTopicSelector from './podcast-topic-selector';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

const PodcastFeed: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();

	// const { setUserRealName, setPodcastCategories } = useDispatch( ONBOARD_STORE );

	const [ name, setName ] = useState( '' );
	const [ podcastCategory1, setPodcastCategory1 ] = useState( '' );
	const [ podcastCategory2, setPodcastCategory2 ] = useState( '' );
	const [ podcastCategory3, setPodcastCategory3 ] = useState( '' );

	const state = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] ).getState();

	useEffect( () => {
		//const { name, podcastCategory1, podcastCategory2, podcastCategory3 } = state;
		// setName( name );
		// setPodcastCategory1( podcastCategory1 );
		// setPodcastCategory2( podcastCategory1 );
		// setPodcastCategory3( podcastCategory1 );
	}, [ state ] );

	const handleSubmit = ( event: FormEvent ) => {
		event.preventDefault();

		// setUserRealName( name );
		//setPodcastCategories( [ podcastCategory1, podcastCategory2, podcastCategory3 ] );

		submit?.( { name, podcastCategory1, podcastCategory2, podcastCategory3 } );
		//submit?.();
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
				<form onSubmit={ handleSubmit } className="setup-form__form">
					<FormFieldset>
						<FormLabel htmlFor="setup-form-input-name">{ __( 'Podcast host' ) }</FormLabel>
						<TextControl
							name="setup-form-input-name"
							id="setup-form-input-name"
							value={ name }
							onChange={ ( value ) => setName( value ) }
							placeholder={ __( 'Your name' ) }
						/>
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="podcasting_category_1">{ __( 'Podcast topics' ) }</FormLabel>
						<FormSettingExplanation>
							{ __(
								'Choose up to three categories how your podcast should be categorized within Apple Podcasts and other podcasting services.'
							) }
						</FormSettingExplanation>
						{ /*
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
						*/ }
						<TopicsSelector
							id="podcasting_category_1"
							name="podcasting_category_1"
							onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
								// eslint-disable-next-line no-console
								console.log( 'PodcastTopicSelector 1', event );
								setPodcastCategory1( event.target.value );
							} }
							value={ podcastCategory1 }
						/>
						<TopicsSelector
							id="podcasting_category_2"
							name="podcasting_category_2"
							onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
								// eslint-disable-next-line no-console
								console.log( 'PodcastTopicSelector 2', event );
								setPodcastCategory2( event.target.value );
							} }
							value={ podcastCategory2 }
						/>
						<TopicsSelector
							id="podcasting_category_3"
							name="podcasting_category_3"
							onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
								// eslint-disable-next-line no-console
								console.log( 'PodcastTopicSelector 3', event );
								setPodcastCategory3( event.target.value );
							} }
							value={ podcastCategory3 }
						/>

						<Button className="setup-form__submit" variant="primary" type="submit">
							{ __( 'Continue' ) }
						</Button>
					</FormFieldset>
				</form>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PodcastFeed;
