/**
 * External dependencies
 */
import React, { Component } from 'react';
import { flowRight, partialRight, pick } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import Protect from './protect';
import Sso from './sso';
import QueryJetpackModules from 'components/data/query-jetpack-modules';

class SiteSettingsFormSecurity extends Component {
	renderSectionHeader( title, showButton = true, disableButton = false ) {
		const { isRequestingSettings, isSavingSettings, translate } = this.props;
		return (
			<SectionHeader label={ title }>
				{ showButton &&
					<Button
						compact
						primary
						onClick={ this.props.handleSubmitForm }
						disabled={ isRequestingSettings || isSavingSettings || disableButton }>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				}
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
			jetpackSettingsUISupported,
			onChangeField,
			setFieldValue,
			siteId,
			translate
		} = this.props;

		if ( ! jetpackSettingsUISupported ) {
			return null;
		}

		return (
			<form
				id="site-settings"
				onSubmit={ handleSubmitForm }
				className="site-settings__security-settings"
			>
				<QueryJetpackModules siteId={ siteId } />

				{ this.renderSectionHeader( translate( 'Prevent brute force login attacks' ) ) }
				<Protect
					fields={ fields }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					onChangeField={ onChangeField }
					setFieldValue={ setFieldValue }
				/>

				{ this.renderSectionHeader( translate( 'WordPress.com sign in' ), false ) }
				<Sso
					handleAutosavingToggle={ handleAutosavingToggle }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			</form>
		);
	}
}

const getFormSettings = partialRight( pick, [
	'protect',
	'jetpack_protect_global_whitelist',
	'sso',
	'jetpack_sso_match_by_email',
	'jetpack_sso_require_two_step',
] );

export default flowRight(
	localize,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormSecurity );
