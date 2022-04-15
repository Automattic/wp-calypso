import { Title, SubTitle, ActionButtons, BackButton, NextButton } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import { useTrackStep } from 'calypso/landing/gutenboarding/hooks/use-track-step';
import { ProvidedDependencies } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useIsAnchorFm } from '../../../gutenboarding/path';
import { ONBOARD_STORE } from '../../stores';
import FontSelect from './font-select';
import Preview from './preview';
import ViewportSelect from './viewport-select';
import type { Viewport } from './types';

import './style.scss';

const StylePreview: React.FunctionComponent< {
	goBack?: () => void;
	submit?: () => ( providedDependencies?: ProvidedDependencies, ...params: string[] ) => void;
} > = ( { goBack, submit } ) => {
	const { getSelectedFonts } = useSelect( ( select ) => select( ONBOARD_STORE ) );

	const { __ } = useI18n();

	const [ selectedViewport, setSelectedViewport ] = React.useState< Viewport >( 'desktop' );

	const isAnchorFmSignup = useIsAnchorFm();

	useTrackStep( 'Style', () => ( {
		selected_heading_font: getSelectedFonts()?.headings,
		selected_body_font: getSelectedFonts()?.base,
	} ) );

	const handleBack = () => {
		goBack?.();
	};

	const handleNext = () => {
		submit?.();
	};

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
						{ goBack && <BackButton onClick={ handleBack } /> }
						<NextButton onClick={ handleNext } />
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
