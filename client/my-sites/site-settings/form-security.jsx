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
import Sso from './sso';
import QueryJetpackModules from 'components/data/query-jetpack-modules';

class SiteSettingsFormSecurity extends Component {
	renderSectionHeader( title, showButton = true ) {
		const { isRequestingSettings, isSavingSettings, translate } = this.props;
		return (
			<SectionHeader label={ title }>
				{ showButton &&
					<Button
						compact
						primary
						onClick={ this.props.handleSubmitForm }
						disabled={ isRequestingSettings || isSavingSettings }>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				}
			</SectionHeader>
		);
	}

	render() {
		const {
			fields,
			handleToggle,
			jetpackSettingsUISupported,
			handleSubmitForm,
			isRequestingSettings,
			isSavingSettings,
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

				{ this.renderSectionHeader( translate( 'WordPress.com log in' ) ) }
				<Sso
					handleToggle={ handleToggle }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			</form>
		);
	}
}

const getFormSettings = partialRight( pick, [
	'sso',
	'jetpack_sso_match_by_email',
	'jetpack_sso_require_two_step',
] );

export default flowRight(
	localize,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormSecurity );
