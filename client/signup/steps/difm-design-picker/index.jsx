// eslint-disable-next-line

import styled from '@emotion/styled';
import { localize, useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import WebPreview from 'calypso/components/web-preview';
import StepWrapper from 'calypso/signup/step-wrapper';
import DemoTile from 'calypso/signup/steps/difm-design-picker/demo-tile';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getRecommendedThemes as fetchRecommendedThemes } from 'calypso/state/themes/actions';
import { getRecommendedThemes } from 'calypso/state/themes/selectors';
import VerticalTemplateMapping from './vertical-template-mapping';

import './style.scss';

const Container = styled.div`
	@media ( max-width: 960px ) {
		margin: 0 20px;
	}
	@media ( max-wdith: 425px ) {
		margin-bottom: 180px;
	}
`;

const VerticalsGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	column-gap: 24px;
	row-gap: 48px;
	text-align: center;
	padding: 1px;
	@media ( max-width: 960px ) {
		grid-template-columns: 1fr;
	}
`;

function DIFMDesignPickerStep( props ) {
	const translate = useTranslate();
	const [ sitePreviewURL, setSitePreviewURL ] = useState( null );
	const [ selectedVertical, setSelectedVertical ] = useState( 'Local services' );
	const { templates } = VerticalTemplateMapping[ selectedVertical ] ?? [];

	const pickDesign = ( selectedDesign ) => {
		props.submitSignupStep(
			{
				stepName: props.stepName,
			},
			{
				selectedDesign,
			}
		);

		props.goToNextStep();
	};

	return (
		<StepWrapper
			headerText={ translate( 'Choose a design' ) }
			subHeaderText={ translate( 'Select the look and feel for your site' ) }
			stepContent={
				<Container>
					<FormFieldset>
						<FormSelect onChange={ ( e ) => setSelectedVertical( e.target.value ) } id="select">
							{ Object.keys( VerticalTemplateMapping ).map( ( v ) => (
								<option value={ v } key={ v }>
									{ v }
								</option>
							) ) }
						</FormSelect>
					</FormFieldset>
					{ sitePreviewURL && (
						<WebPreview
							showPreview={ true }
							showExternal={ false }
							showSEO={ false }
							onClose={ () => setSitePreviewURL( null ) }
							previewUrl={ sitePreviewURL + '?demo=true&iframe=true&theme_preview=true' }
							externalUrl={ sitePreviewURL }
						></WebPreview>
					) }
					<VerticalsGrid>
						{ templates.map( ( { name, displayName, thumbnail, templateUrl } ) => (
							<DemoTile
								key={ name }
								id={ name }
								name={ displayName }
								image={ thumbnail }
								templateUrl={ templateUrl }
								onShowPreview={ () => setSitePreviewURL( templateUrl ) }
								selectDesign={ () => pickDesign( name ) }
							/>
						) ) }
					</VerticalsGrid>
				</Container>
			}
			align={ props.isReskinned ? 'left' : 'center' }
			hideSkip
			{ ...props }
		/>
	);
}

export default connect(
	( state ) => {
		return {
			themes: getRecommendedThemes( state, 'auto-loading-homepage' ),
		};
	},
	{ fetchRecommendedThemes, submitSignupStep }
)( localize( DIFMDesignPickerStep ) );
