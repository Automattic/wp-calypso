/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FontSelect from 'calypso/landing/gutenboarding/onboarding-block/style-preview/font-select';
import Preview from 'calypso/landing/gutenboarding/onboarding-block/style-preview/preview';
import { Viewport } from 'calypso/landing/gutenboarding/onboarding-block/style-preview/types';
import ViewportSelect from 'calypso/landing/gutenboarding/onboarding-block/style-preview/viewport-select';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

import './style.scss';

const FontPairingStep: Step = function FontPairingStep( { navigation } ) {
	const { goBack, submit } = navigation;
	const { __ } = useI18n();
	const headerText = __( 'Pick a font pairing' );
	const subHeaderText = __(
		'Customize your design with typography that best suits your podcast. You can always fine-tune it later.'
	);
	const [ selectedViewport, setSelectedViewport ] = React.useState< Viewport >( 'desktop' );

	const FontPairingHeader: React.FC = () => {
		const handleSubmit = () => {
			submit?.();
		};
		return (
			<div className="font-pairing__header">
				<FormattedHeader
					id={ 'font-pairing-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align={ 'left' }
				/>
				<ViewportSelect selected={ selectedViewport } onSelect={ setSelectedViewport } />
				<Button className="font-pairing__submit-button" onClick={ handleSubmit }>
					{ __( 'Continue' ) }
				</Button>
			</div>
		);
	};

	const FontPairingUI: React.FC = () => {
		return (
			<div className="font-pairing__step-content">
				<FontSelect />
				<div className="font-pairing__preview-wrapper">
					<Preview viewport={ selectedViewport } />
				</div>
			</div>
		);
	};

	return (
		<StepContainer
			stepName={ 'font-pairing-step' }
			goBack={ goBack }
			hideSkip
			isFullLayout
			formattedHeader={ <FontPairingHeader /> }
			stepContent={ <FontPairingUI /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default FontPairingStep;
