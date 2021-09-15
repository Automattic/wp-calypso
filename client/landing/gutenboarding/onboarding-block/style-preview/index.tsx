import { Title, SubTitle, ActionButtons, BackButton, NextButton } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import { useIsAnchorFm } from '../../../gutenboarding/path';
import useStepNavigation from '../../hooks/use-step-navigation';
import { useTrackStep } from '../../hooks/use-track-step';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import FontSelect from './font-select';
import Preview from './preview';
import ViewportSelect from './viewport-select';
import type { Viewport } from './types';

import './style.scss';

const StylePreview: React.FunctionComponent = () => {
	const { getSelectedFonts } = useSelect( ( select ) => select( ONBOARD_STORE ) );

	const { __ } = useI18n();
	const { goBack, goNext } = useStepNavigation();

	const [ selectedViewport, setSelectedViewport ] = React.useState< Viewport >( 'desktop' );

	const isAnchorFmSignup = useIsAnchorFm();

	useTrackStep( 'Style', () => ( {
		selected_heading_font: getSelectedFonts()?.headings,
		selected_body_font: getSelectedFonts()?.base,
	} ) );

	return (
		<>
			<div className="gutenboarding-page style-preview">
				<div className="style-preview__header">
					<div className="style-preview__titles">
						<Title data-e2e-string="Pick a font pairing">{ __( 'Pick a font pairing' ) }</Title>
						<SubTitle data-e2e-string="Customize your design with typography. You can always fine-tune it later.">
							{ isAnchorFmSignup
								? __(
										'Customize your design with typography that best suits your podcast. You can always fine-tune it later.'
								  )
								: __(
										'Customize your design with typography. You can always fine-tune it later.'
								  ) }
						</SubTitle>
					</div>
					<ViewportSelect selected={ selectedViewport } onSelect={ setSelectedViewport } />
					<ActionButtons className="style-preview__actions">
						<BackButton onClick={ goBack } />
						<NextButton onClick={ goNext } />
					</ActionButtons>
				</div>
				<div className="style-preview__content">
					<FontSelect />
					<Preview viewport={ selectedViewport } />
				</div>
			</div>
		</>
	);
};

export default StylePreview;
