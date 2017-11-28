/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import config from 'config';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { mailChimpSaveSettings } from 'woocommerce/state/sites/settings/mailchimp/actions';
import { isSavingSettings } from 'woocommerce/state/sites/settings/mailchimp/selectors';
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import EmailSettings from './email-settings';
import MailChimp from './mailchimp';
import Main from 'components/main';
import SettingsNavigation from '../navigation';

const SettingsEmail = ( { site, translate, className, params, isSaving, mailChimpSaveSettings: saveSettings } ) => {
	const breadcrumbs = [
		( <a href={ getLink( '/store/settings/:site/', site ) }>{ translate( 'Settings' ) }</a> ),
		( <span>{ translate( 'Email' ) }</span> ),
	];

	const { setup } = params;
	const startWizard = 'wizard' === setup;

	const onSave = () => (
		saveSettings( site.ID )
	);

	return (
		<Main className={ classNames( 'email', className ) } wideLayout>
			<ActionHeader breadcrumbs={ breadcrumbs } >
				<Button primary onClick={ onSave } busy={ isSaving } disabled={ isSaving }>
					{ translate( 'Save' ) }
				</Button>
			</ActionHeader>
			<SettingsNavigation activeSection="email" />
			{ config.isEnabled( 'woocommerce/extension-settings-email-generic' ) &&
				<EmailSettings siteId={ site.ID } />
			}
			<MailChimp siteId={ site.ID } site={ site } startWizard={ startWizard } />
		</Main>
	);
};

SettingsEmail.propTypes = {
	className: PropTypes.string,
	site: PropTypes.shape( {
		slug: PropTypes.string,
		ID: PropTypes.number,
	} ),
	mailChimpSaveSettings: PropTypes.func.isRequired,
};

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	return {
		site,
		isSaving: isSavingSettings( state, site.ID ),
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			mailChimpSaveSettings
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( SettingsEmail ) );
