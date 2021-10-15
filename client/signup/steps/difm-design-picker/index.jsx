// eslint-disable-next-line

import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import WebPreview from 'calypso/components/web-preview';
import StepWrapper from 'calypso/signup/step-wrapper';
import DemoTile from 'calypso/signup/steps/difm-design-picker/demo-tile';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import VerticalTemplateMapping from './vertical-template-mapping';

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

export default function DIFMDesignPickerStep( props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ sitePreviewURL, setSitePreviewURL ] = useState( null );
	const [ selectedVertical, setSelectedVertical ] = useState( 'Local Services' );
	const { templates } = VerticalTemplateMapping[ selectedVertical ] ?? [];

	useEffect( () => {
		dispatch( saveSignupStep( { stepName: props.stepName } ) );
	}, [ dispatch, props.stepName ] );

	const pickDesign = ( selectedDesign ) => {
		props.submitSignupStep(
			{
				stepName: props.stepName,
			},
			{
				selectedDIFMDesign: selectedDesign,
				selectedVertical: selectedVertical,
			}
		);

		props.goToNextStep();
	};

	const headerText = translate( 'Choose a design' );
	const subHeaderText = translate( 'Select the look and feel for your site' );
	return (
		<StepWrapper
			headerText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackHeaderText={ headerText }
			fallbackSubHeaderText={ subHeaderText }
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
							previewUrl={
								sitePreviewURL + '?demo=true&iframe=true&theme_preview=true&hide_banners=true'
							}
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
			hideNext
			hideBack
			{ ...props }
		/>
	);
}
