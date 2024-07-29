/* eslint-disable wpcalypso/jsx-classname-namespace */

import config from '@automattic/calypso-config';
import { StyleVariation } from '@automattic/design-picker';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';

import './styles.scss';

type ThemeStyle = {
	name: string;
	title: string;
};

const styles: ThemeStyle[] = [
	{ name: 'charcoal', title: 'Charcoal' },
	{ name: 'rainforest', title: 'Rainforest' },
	{ name: 'ruby-wine', title: 'Ruby Wine' },
	{ name: 'blue-yellow', title: 'Blue/Yellow' },
	{ name: 'grey-bordeaux', title: 'Light Grey/Bordeaux' },
	{ name: 'grey-mint', title: 'Grey/Mint Green' },
	{ name: 'olive-pink', title: 'Olive Green/Light Pink' },
	{ name: 'white', title: 'White' },
];

const VideomakerSetup: Step = function VideomakerSetup( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const { setSelectedDesign, setSelectedStyleVariation } = useDispatch( ONBOARD_STORE );

	const onSelectTheme = ( slug: string, styleVariation?: ThemeStyle ) => {
		setSelectedDesign( {
			slug: 'videomaker',
			theme: slug,
			title: 'Videomaker',
			categories: [],
		} );

		if ( config.isEnabled( 'videomaker-trial' ) && styleVariation ) {
			setSelectedStyleVariation( {
				slug: styleVariation.name,
				title: styleVariation.title,
			} as StyleVariation );
		}

		submit?.();
	};

	const stepContent = (
		<div className="videomaker-setup__step-content">
			<div className="videomaker-setup__theme-picker">
				<button
					className="videomaker-setup__dark-button"
					onClick={ () =>
						onSelectTheme(
							config.isEnabled( 'videomaker-trial' ) ? 'pub/videomaker' : 'premium/videomaker'
						)
					}
				>
					<img
						src="https://videopress2.files.wordpress.com/2022/12/videomaker-dark.jpg"
						alt={ __( 'Videomaker dark' ) }
					/>
				</button>
				<button
					className="videomaker-setup__light-button"
					onClick={ () =>
						onSelectTheme(
							config.isEnabled( 'videomaker-trial' )
								? 'pub/videomaker'
								: 'premium/videomaker-white',
							styles.find( ( style ) => 'white' === style.name )
						)
					}
				>
					<img
						src="https://videopress2.files.wordpress.com/2022/12/videomaker-light.jpg"
						alt={ __( 'Videomaker white' ) }
					/>
				</button>
			</div>
		</div>
	);

	return (
		<StepContainer
			stepName="videomaker-setup"
			isWideLayout
			hideBack
			flowName="videopress"
			formattedHeader={
				<FormattedHeader
					id="videomaker-setup-header"
					headerText={ __( 'Choose a design' ) }
					subHeaderText={ __(
						'This is what your homepage will look like. You’ll be able to customize it further at any time.'
					) }
					align="center"
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
			showVideoPressPowered
		/>
	);
};

export default VideomakerSetup;
