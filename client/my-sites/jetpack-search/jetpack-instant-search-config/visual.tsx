/**
 * External dependencies
 */
import React, { ReactElement, Fragment } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';

export default function JetpackSearchInstantSearchVisualConfig(): ReactElement {
	return (
		<Fragment>
			<SettingsSectionHeader
				id="jetpack-search-visualsettings"
				showButton
				title={ translate( 'Visuals', { context: 'Settings header' } ) }
				// TODO: Configure the following
				// disabled={ isRequestingSettings || isSavingSettings }
				// isSaving={ isSavingSettings }
				// onButtonClick={ handleSubmitForm }
			/>
			<Card>
				<FormFieldset className="jetpack-instant-search-config__theme">
					<FormLegend>{ translate( 'Theme' ) }</FormLegend>
					<FormRadiosBar
						checked="light"
						isThumbnail
						items={ [
							{
								label: translate( 'Light', { context: 'Jetpack search theme' } ),
								value: 'light',
								thumbnail: {
									cssClass: 'some-css-class',
								},
							},
							{
								label: translate( 'Dark', { context: 'Jetpack search theme' } ),
								value: 'dark',
								thumbnail: {
									cssClass: 'some-css-class',
								},
							},
						] }
					/>
				</FormFieldset>
				<FormFieldset className="jetpack-instant-search-config__result-format">
					<FormLegend>{ translate( 'Result Format' ) }</FormLegend>
					<FormRadiosBar
						checked="minimal"
						isThumbnail
						items={ [
							{
								label: translate( 'Minimal', { context: 'Jetpack Search result format' } ),
								value: 'minimal',
								thumbnail: {
									cssClass: 'some-css-class',
								},
							},
							{
								label: translate( 'Expanded', { context: 'Jetpack Search result format' } ),
								value: 'expanded',
								thumbnail: {
									cssClass: 'some-css-class',
								},
							},
							{
								label: translate( 'Product', { context: 'Jetpack Search result format' } ),
								value: 'product',
								thumbnail: {
									cssClass: 'some-css-class',
								},
							},
						] }
					/>
				</FormFieldset>
				<FormFieldset className="jetpack-instant-search-config__highlight-color">
					<FormLegend>{ translate( 'Search Highlight Color' ) }</FormLegend>
					{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
					<input type="color" className="form-text-input" />
				</FormFieldset>
			</Card>
		</Fragment>
	);
}
