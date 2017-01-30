/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import Button from 'components/button';
import JetpackModuleToggle from '../jetpack-module-toggle';
import FormLegend from 'components/forms/form-legend';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackModuleActive } from 'state/selectors';
import { regeneratePostByEmail } from 'state/jetpack/settings/actions';
import { isRegeneratingJetpackPostByEmail } from 'state/selectors';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import ClipboardButtonInput from 'components/clipboard-button-input';
import PressThis from '../press-this';

class PublishingTools extends Component {
	componentDidUpdate() {
		const {
			fields,
			postByEmailAddressModuleActive,
			regeneratingPostByEmail,
			selectedSiteId
		} = this.props;

		if ( postByEmailAddressModuleActive && regeneratingPostByEmail === null && ! fields.post_by_email_address ) {
			this.props.regeneratePostByEmail( selectedSiteId );
		}
	}

	onRegenerateButtonClick = () => {
		this.props.regeneratePostByEmail( this.props.selectedSiteId );
	}

	isFormPending() {
		const {
			isRequestingSettings,
			isSavingSettings,
		} = this.props;

		return isRequestingSettings || isSavingSettings;
	}

	renderPostByEmailSettings() {
		const { fields, translate, postByEmailAddressModuleActive, regeneratingPostByEmail } = this.props;
		const isFormPending = this.isFormPending();
		const email = fields.post_by_email_address && fields.post_by_email_address !== 'regenerate' ? fields.post_by_email_address : '';
		const labelClassName = regeneratingPostByEmail || ! postByEmailAddressModuleActive ? 'is-disabled' : null;

		return (
			<div className="publishing-tools__module-settings is-indented">
				<FormLabel className={ labelClassName }>
					{ translate( 'Email Address' ) }
				</FormLabel>
				<ClipboardButtonInput
					className="publishing-tools__email-address"
					disabled={ regeneratingPostByEmail || ! postByEmailAddressModuleActive }
					value={ email }
				/>
				<Button
					compact
					onClick={ this.onRegenerateButtonClick }
					disabled={ isFormPending || regeneratingPostByEmail || ! postByEmailAddressModuleActive }
				>
					{ regeneratingPostByEmail
						? translate( 'Regenerating…' )
						: translate( 'Regenerate address' )
					}
				</Button>
			</div>
		);
	}

	renderPostByEmailModule() {
		const {
			selectedSiteId,
			translate
		} = this.props;
		const formPending = this.isFormPending();

		return (
			<FormFieldset>
				<div className="publishing-tools__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink href={ 'https://jetpack.com/support/post-by-email/' } target="_blank">
							{ translate( 'Learn more about Post by Email' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="post-by-email"
					label={ translate( 'Publish posts by sending an email.' ) }
					disabled={ formPending }
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
		const { translate } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Publishing Tools' ) } />

				<Card className="publishing-tools__card site-settings">
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
	fields: {}
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

		return {
			selectedSiteId,
			regeneratingPostByEmail,
			postByEmailAddressModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'post-by-email' ),
		};
	},
	{
		regeneratePostByEmail
	}
)( localize( PublishingTools ) );
