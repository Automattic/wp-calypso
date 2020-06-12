/**
 * External dependencies
 */
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Preview from './preview';
import ViewportSelect from './viewport-select';
import FontSelect from './font-select';
import { Title, SubTitle } from '../../components/titles';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { useTrackStep } from '../../hooks/use-track-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import ActionButtons, { BackButton, NextButton } from '../../components/action-buttons';
import type { Viewport } from './types';

/**
 * Style dependencies
 */
import './style.scss';

const StylePreview: React.FunctionComponent = () => {
	const { getSelectedFonts } = useSelect( ( select ) => select( ONBOARD_STORE ) );

	const { __ } = useI18n();
	const { goBack, goNext } = useStepNavigation();

	const [ selectedViewport, setSelectedViewport ] = React.useState< Viewport >( 'desktop' );

	useTrackStep( 'Style', () => ( {
		selected_heading_font: getSelectedFonts()?.headings,
		selected_body_font: getSelectedFonts()?.base,
	} ) );

	return (
		<>
			<div className="gutenboarding-page style-preview">
				<div className="style-preview__header">
					<div className="style-preview__titles">
						<Title>{ __( 'Pick a font pairing' ) }</Title>
						<SubTitle>
							{ __( 'Customize your design with typography. You can always fine-tune it later.' ) }
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
