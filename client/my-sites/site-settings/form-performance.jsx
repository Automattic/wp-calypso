/** @format */

/**
 * External dependencies
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { flowRight, partialRight, pick } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import MediaSettings from 'my-sites/site-settings/media-settings';
import SectionHeader from 'components/section-header';
import SpeedUpYourSite from 'my-sites/site-settings/speed-up-site-settings';
import wrapSettingsForm from './wrap-settings-form';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isJetpackSite,
	isJetpackMinimumVersion,
	siteSupportsJetpackSettingsUi,
} from 'state/sites/selectors';
import QueryJetpackModules from 'components/data/query-jetpack-modules';

class SiteSettingsFormPerformance extends Component {
	renderSectionHeader( title, showButton = true ) {
		const { isRequestingSettings, isSavingSettings, translate } = this.props;
		return (
			<SectionHeader label={ title }>
				{ showButton && (
					<Button
						compact
						primary
						onClick={ this.props.handleSubmitForm }
						disabled={ isRequestingSettings || isSavingSettings }
					>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				) }
			</SectionHeader>
		);
	}

	render() {
		const {
			fields,
			handleAutosavingToggle,
			handleSubmitForm,
			isRequestingSettings,
			isSavingSettings,
			jetpackSettingsUI,
			jetpackVersionSupportsLazyImages,
			onChangeField,
			siteId,
			submitForm,
			translate,
			updateFields,
		} = this.props;

		return (
			<form
				id="site-settings"
				onSubmit={ handleSubmitForm }
				className="site-settings__performance-settings"
			>
				<QueryJetpackModules siteId={ this.props.siteId } />

				{ jetpackSettingsUI &&
					jetpackVersionSupportsLazyImages && (
						<Fragment>
							{ this.renderSectionHeader( translate( 'Performance & speed' ), false ) }
							<SpeedUpYourSite
								isSavingSettings={ isSavingSettings }
								isRequestingSettings={ isRequestingSettings }
								jetpackVersionSupportsLazyImages={ jetpackVersionSupportsLazyImages }
								submitForm={ submitForm }
								updateFields={ updateFields }
							/>
						</Fragment>
					) }

				{ jetpackSettingsUI && (
					<Fragment>
						{ this.renderSectionHeader( translate( 'Media' ) ) }
						<MediaSettings
							siteId={ siteId }
							handleAutosavingToggle={ handleAutosavingToggle }
							onChangeField={ onChangeField }
							isSavingSettings={ isSavingSettings }
							isRequestingSettings={ isRequestingSettings }
							fields={ fields }
							jetpackVersionSupportsLazyImages={ jetpackVersionSupportsLazyImages }
						/>
					</Fragment>
				) }
			</form>
		);
	}
}

const connectComponent = connect( state => {
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const jetpackSettingsUiSupported = siteSupportsJetpackSettingsUi( state, siteId );
	const jetpackVersionSupportsLazyImages = isJetpackMinimumVersion( state, siteId, '5.8-alpha' );

	return {
		siteId,
		siteIsJetpack,
		jetpackVersionSupportsLazyImages,
		jetpackSettingsUI: siteIsJetpack && jetpackSettingsUiSupported,
	};
} );

const getFormSettings = partialRight( pick, [
	'photon',
	'photon-cdn',
	'lazy-images',
	'carousel',
	'carousel_background_color',
	'carousel_display_exif',
] );

export default flowRight(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormPerformance );
