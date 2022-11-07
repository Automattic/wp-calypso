import { Gridicon } from '@automattic/components';
import { SenseiStepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import FormRadioWithThumbnail from 'calypso/components/forms/form-radio-with-thumbnail';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE } from '../../../../stores';
import { Title, Label, Input, Button } from './components';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';

import './style.scss';

const SenseiSetupStep: Step = ( { navigation } ) => {
	const { __ } = useI18n();

	const initialSiteTitle = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getSelectedSiteTitle()
	);
	const [ siteTitle, setSiteTitle ] = useState< string >( initialSiteTitle );
	const [ checked, setChecked ] = useState< string >( 'green' );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setChecked?.( event.target.value );
	};

	const { submit } = navigation;
	const dispatch = useDispatch( ONBOARD_STORE );
	const handleSubmit = useCallback( () => {
		dispatch.setSiteTitle( siteTitle );
		if ( submit ) {
			submit();
		}
	}, [ siteTitle, dispatch, submit ] );
	const thumbnailImages = [
		{
			style: 'green',
			title: 'First item',
		},
		{
			style: 'blue',
			title: 'Second item',
		},
		{
			style: 'black',
			title: 'Third item',
		},
		{
			style: 'sepia',
			title: 'Fourth item',
		},
	];

	return (
		<SenseiStepContainer stepName="senseiSetup" recordTracksEvent={ recordTracksEvent }>
			<div className="sensei-start-row">
				<div className="sensei-onboarding-main-content">
					<Title>{ __( 'Set up your course site' ) }</Title>
					<Label htmlFor="sensei_site_title">{ __( 'Site name' ) }</Label>
					<Input
						id="sensei_site_title"
						type="text"
						onChange={ ( ev ) => {
							setSiteTitle( ev.target.value );
						} }
						placeholder={ __( 'My Site Name' ) }
						value={ siteTitle }
					/>
					<div className="sensei-theme-prompt">
						<h4>Pick a style</h4>
						<p>Choose a different theme style now, or customize colors and fonts later.</p>
					</div>
					<div className="sensei-theme-style-selector">
						{ thumbnailImages.map( ( item, i ) => (
							<FormRadioWithThumbnail
								label={ item.title }
								key={ i }
								value={ item.style }
								thumbnail={ {
									cssClass: `${ item.style } ${ item.style === checked ? 'checked' : '' }`,
								} }
								checked={ item.style === checked }
								onChange={ handleChange }
								disabled={ undefined }
							/>
						) ) }
					</div>
					<Button disabled={ ! siteTitle } onClick={ handleSubmit }>
						{ __( 'Continue' ) }
					</Button>
					<p className="sensei-style-notice">
						<Gridicon icon="notice-outline" />
						{ __( 'You can change all of this later, too.' ) }
					</p>
				</div>
				<div className={ `sensei-theme ${ checked }` }></div>
			</div>
		</SenseiStepContainer>
	);
};

export default SenseiSetupStep;
