/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import config from 'config';
import PropTypes from 'prop-types';

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
import { ProtectFormGuard } from 'lib/protect-form';
import SettingsNavigation from '../navigation';

class SettingsEmail extends Component {
	state = {
		pristine: true,
	};

	static propTypes = {
		className: PropTypes.string,
		site: PropTypes.shape( {
			slug: PropTypes.string,
			ID: PropTypes.number,
		} ),
		mailChimpSaveSettings: PropTypes.func.isRequired,
	};

	onChange = () => {
		this.setState( { pristine: false } );
	};

	onSave = () => {
		const { mailChimpSaveSettings: saveSettings, site } = this.props;
		this.setState( { pristine: true } );
		saveSettings( site.ID );
	};

	render = () => {
		const { className, isSaving, params, site, translate } = this.props;

		const breadcrumbs = [
			( <a href={ getLink( '/store/settings/:site/', site ) }>{ translate( 'Settings' ) }</a> ),
			( <span>{ translate( 'Email' ) }</span> ),
		];

		const { setup } = params;
		const startWizard = 'wizard' === setup;

		return (
			<Main className={ classNames( 'email', className ) } wideLayout>
				<ActionHeader breadcrumbs={ breadcrumbs } >
					<Button primary onClick={ this.onSave } busy={ isSaving } disabled={ isSaving }>
						{ translate( 'Save' ) }
					</Button>
				</ActionHeader>
				<SettingsNavigation activeSection="email" />
				{ config.isEnabled( 'woocommerce/extension-settings-email-generic' ) &&
					<EmailSettings siteId={ site.ID } />
				}
				<MailChimp
					onChange={ this.onChange }
					siteId={ site.ID }
					site={ site }
					startWizard={ startWizard }
				/>
				<ProtectFormGuard isChanged={ ! this.state.pristine } />
			</Main>
		);
	};
}

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
			mailChimpSaveSettings,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( SettingsEmail ) );
