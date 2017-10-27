/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Button from 'components/button';
import MailChimp from './mailchimp';
import ActionHeader from 'woocommerce/components/action-header';
import SettingsNavigation from '../navigation';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { mailChimpSaveSettings } from 'woocommerce/state/sites/settings/email/actions';
import { isSavingSettings } from 'woocommerce/state/sites/settings/email/selectors';

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
		<Main className={ classNames( 'email', className ) }>
			<ActionHeader breadcrumbs={ breadcrumbs } >
				<Button primary onClick={ onSave } busy={ isSaving } disabled={ isSaving }>
					{ translate( 'Save' ) }
				</Button>
			</ActionHeader>
			<SettingsNavigation activeSection="email" />
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
