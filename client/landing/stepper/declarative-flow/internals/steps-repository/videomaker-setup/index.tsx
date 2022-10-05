/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import React, { FormEvent } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE } from '../../../../stores';
import type { Step } from '../../types';

import './styles.scss';

const VideomakerSetup: Step = function VideomakerSetup( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );
	const { selectedDesign } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );

	const handleSubmit = async ( event: FormEvent ) => {
		event.preventDefault();

		// Set some flow meta here?

		submit?.();
	};

	const lightClasses = classNames( 'videomaker-setup__light-button', {
		selected: 'premium/videomaker-white' === selectedDesign?.theme,
	} );

	const darkClasses = classNames( 'videomaker-setup__dark-button', {
		selected: 'premium/videomaker' === selectedDesign?.theme,
	} );

	const stepContent = (
		<div className="videomaker-setup__step-content">
			<div className="videomaker-setup__theme-picker">
				<button
					className={ darkClasses }
					onClick={ () =>
						setSelectedDesign( {
							slug: 'videomaker',
							theme: 'premium/videomaker',
							is_premium: true,
							title: 'Videomaker',
							categories: [],
							features: [],
							template: '',
						} )
					}
				>
					<img
						src="https://videopress2.files.wordpress.com/2022/10/videomaker-theme-dark.jpg"
						alt={ __( 'Videomaker dark' ) }
					/>
				</button>
				<button
					className={ lightClasses }
					onClick={ () =>
						setSelectedDesign( {
							slug: 'videomaker',
							theme: 'premium/videomaker-white',
							is_premium: true,
							title: 'Videomaker',
							categories: [],
							features: [],
							template: '',
						} )
					}
				>
					<img
						src="https://videopress2.files.wordpress.com/2022/10/videomaker-theme-light.jpg"
						alt={ __( 'Videomaker white' ) }
					/>
				</button>
			</div>
			<form className="videomaker-setup__form" onSubmit={ handleSubmit }>
				<Button className="videomaker-setup-form__submit" primary type="submit">
					{ __( 'Continue' ) }
				</Button>
			</form>
		</div>
	);

	return (
		<StepContainer
			stepName={ 'videomaker-setup' }
			isWideLayout={ true }
			hideBack={ true }
			flowName={ 'videopress' }
			formattedHeader={
				<FormattedHeader
					id={ 'videomaker-setup-header' }
					headerText={ __( 'Choose a design' ) }
					subHeaderText={ __(
						'This is what your homepage will look like. You’ll be able to customize it further at any time.'
					) }
					align={ 'center' }
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
			showVideoPressPowered
		/>
	);
};

export default VideomakerSetup;
