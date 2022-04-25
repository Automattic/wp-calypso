/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { useState, useRef } from 'react';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import getTextWidth from 'calypso/landing/gutenboarding/onboarding-block/acquire-intent/get-text-width';
import usePodcastTitle from 'calypso/landing/stepper/hooks/use-podcast-title';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tip } from 'calypso/signup/icons';
import type { Step } from '../../types';
import './style.scss';

const PodcastTitleStep: Step = function PodcastTitleStep( { navigation } ) {
	const { goBack, submit } = navigation;
	const { __ } = useI18n();

	const PodcastTitleForm: React.FC = () => {
		const [ formTouched, setFormTouched ] = useState( false );
		const podcastTitle = usePodcastTitle();
		const { setSiteTitle } = useDispatch( ONBOARD_STORE );
		const inputRef = useRef< HTMLInputElement >();

		const handleSubmit = () => {
			submit?.();
		};

		const underlineWidth = getTextWidth( ( podcastTitle as string ) || '', inputRef.current );

		const handleChange = ( event: React.FormEvent< HTMLInputElement > ) => {
			setFormTouched( true );
			setSiteTitle( event.currentTarget.value );
		};
		return (
			<form className="podcast-title__form" onSubmit={ handleSubmit }>
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
