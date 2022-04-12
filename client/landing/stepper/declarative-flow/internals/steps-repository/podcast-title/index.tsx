/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { useState, useRef } from 'react';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import getTextWidth from 'calypso/landing/gutenboarding/onboarding-block/acquire-intent/get-text-width';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tip } from 'calypso/signup/icons';
import type { Step } from '../../types';

import './style.scss';

const PodcastTitleStep: Step = function PodcastTitleStep( { navigation } ) {
	const { goBack, submit } = navigation;
	const { __ } = useI18n();

	const PodcastTitleForm: React.FC = () => {
		const [ podcastTitle, setPodcastTitle ] = useState( '' );
		const [ formTouched, setFormTouched ] = useState( false );
		const [ underlineWidth, setUnderlineWidth ] = useState( 0 );
		const inputRef = useRef() as React.MutableRefObject< HTMLInputElement >;

		const handleSubmit = () => {
			submit?.();
		};

		const handleChange = ( event: React.FormEvent< HTMLInputElement > ) => {
			setFormTouched( true );
			const underlineWidth = getTextWidth( podcastTitle as string, inputRef.current );
			setUnderlineWidth( underlineWidth );
			return setPodcastTitle( event.currentTarget.value );
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
						/>
						<div
							className={ classNames( 'podcast-title__underline', {
								'is-empty': ! ( podcastTitle as string )?.length,
							} ) }
							style={ { width: underlineWidth } }
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

	const handleClick = () => {
		submit?.();
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
