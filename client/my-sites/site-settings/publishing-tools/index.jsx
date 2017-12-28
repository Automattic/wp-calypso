/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import SectionHeader from 'client/components/section-header';
import Card from 'client/components/card';
import Button from 'client/components/button';
import JetpackModuleToggle from 'client/my-sites/site-settings/jetpack-module-toggle';
import FormLegend from 'client/components/forms/form-legend';
import FormFieldset from 'client/components/forms/form-fieldset';
import FormLabel from 'client/components/forms/form-label';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { regeneratePostByEmail } from 'client/state/jetpack/settings/actions';
import {
	isJetpackModuleActive,
	isJetpackModuleUnavailableInDevelopmentMode,
	isJetpackSiteInDevelopmentMode,
	isRegeneratingJetpackPostByEmail,
} from 'client/state/selectors';
import InfoPopover from 'client/components/info-popover';
import ExternalLink from 'client/components/external-link';
import ClipboardButtonInput from 'client/components/clipboard-button-input';
import PressThis from '../press-this';
import QueryJetpackConnection from 'client/components/data/query-jetpack-connection';

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
				<FormLabel className={ labelClassName }>{ translate( 'Email Address' ) }</FormLabel>
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
		const { moduleUnavailable, selectedSiteId, translate } = this.props;
		const formPending = this.isFormPending();

		return (
			<FormFieldset>
				<div className="publishing-tools__info-link-container site-settings__info-link-container">
					<InfoPopover position="left">
						<ExternalLink href="https://jetpack.com/support/post-by-email/" icon target="_blank">
							{ translate( 'Learn more about Post by Email.' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

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

	renderPressThis() {
		const { translate } = this.props;
		if ( ! config.isEnabled( 'press-this' ) ) {
			return null;
		}

		return (
			<div>
				<FormLegend>{ translate( 'Press This' ) }</FormLegend>
				<PressThis />
			</div>
		);
	}

	render() {
		const { selectedSiteId, translate } = this.props;

		return (
			<div>
				<QueryJetpackConnection siteId={ selectedSiteId } />

				<SectionHeader label={ translate( 'Publishing Tools' ) } />

				<Card className="publishing-tools__card site-settings__module-settings">
					{ this.renderPostByEmailModule() }
					<hr />
					{ this.renderPressThis() }
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
	state => {
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
