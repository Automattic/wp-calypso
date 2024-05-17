import { Card, Button, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { regeneratePostByEmail } from 'calypso/state/jetpack/settings/actions';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import isRegeneratingJetpackPostByEmail from 'calypso/state/selectors/is-regenerating-jetpack-post-by-email';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PressThis from '../press-this';

import './style.scss';

class PublishingTools extends Component {
	componentDidUpdate() {
		const {
			fields,
			moduleUnavailable,
			postByEmailAddressModuleActive,
			regeneratingPostByEmail,
			selectedSiteId,
		} = this.props;

		if ( ! moduleUnavailable ) {
			return;
		}

		if (
			postByEmailAddressModuleActive &&
			regeneratingPostByEmail === null &&
			! fields.post_by_email_address
		) {
			this.props.regeneratePostByEmail( selectedSiteId );
		}
	}

	onRegenerateButtonClick = () => {
		this.props.regeneratePostByEmail( this.props.selectedSiteId );
	};

	isFormPending() {
		const { isRequestingSettings, isSavingSettings } = this.props;

		return isRequestingSettings || isSavingSettings;
	}

	renderPostByEmailSettings() {
		const {
			fields,
			moduleUnavailable,
			translate,
			postByEmailAddressModuleActive,
			regeneratingPostByEmail,
		} = this.props;
		const isFormPending = this.isFormPending();
		const email =
			fields.post_by_email_address && fields.post_by_email_address !== 'regenerate'
				? fields.post_by_email_address
				: '';
		const labelClassName =
			moduleUnavailable || regeneratingPostByEmail || ! postByEmailAddressModuleActive
				? 'is-disabled'
				: null;

		return (
			<div className="publishing-tools__module-settings site-settings__child-settings">
				<FormLabel className={ labelClassName }>
					{ translate( 'Send your new posts to this email address:' ) }
				</FormLabel>
				<ClipboardButtonInput
					className="publishing-tools__email-address"
					disabled={
						regeneratingPostByEmail || ! postByEmailAddressModuleActive || moduleUnavailable
					}
					value={ email }
				/>
				<Button
					onClick={ this.onRegenerateButtonClick }
					disabled={
						isFormPending ||
						regeneratingPostByEmail ||
						! postByEmailAddressModuleActive ||
						moduleUnavailable
					}
				>
					{ regeneratingPostByEmail
						? translate( 'Regenerating…' )
						: translate( 'Regenerate address' ) }
				</Button>
			</div>
		);
	}

	renderPostByEmailModule() {
		const { moduleUnavailable, selectedSiteId, translate, isAtomic } = this.props;
		const formPending = this.isFormPending();

		return (
			<FormFieldset>
				<SupportInfo
					text={ translate(
						'Allows you to publish new posts by sending an email to a special address.'
					) }
					link={
						isAtomic
							? localizeUrl( 'https://wordpress.com/support/post-by-email/' )
							: 'https://jetpack.com/support/post-by-email/'
					}
					privacyLink={ ! isAtomic }
				/>
				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="post-by-email"
					label={ translate( 'Publish posts by sending an email' ) }
					disabled={ formPending || moduleUnavailable }
				/>

				{ this.renderPostByEmailSettings() }
			</FormFieldset>
		);
	}

	render() {
		const { selectedSiteId, translate } = this.props;

		return (
			<div>
				<QueryJetpackConnection siteId={ selectedSiteId } />

				<SettingsSectionHeader title={ translate( 'Publishing Tools' ) } />

				<Card className="publishing-tools__card site-settings__module-settings">
					{ this.renderPostByEmailModule() }
					<hr />
					<FormFieldset>
						<PressThis />
					</FormFieldset>
				</Card>
			</div>
		);
	}
}

PublishingTools.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

PublishingTools.propTypes = {
	onSubmitForm: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const regeneratingPostByEmail = isRegeneratingJetpackPostByEmail( state, selectedSiteId );
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
		const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
			state,
			selectedSiteId,
			'post-by-email'
		);

		return {
			selectedSiteId,
			regeneratingPostByEmail,
			postByEmailAddressModuleActive: !! isJetpackModuleActive(
				state,
				selectedSiteId,
				'post-by-email'
			),
			moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
		};
	},
	{
		regeneratePostByEmail,
	}
)( localize( PublishingTools ) );
