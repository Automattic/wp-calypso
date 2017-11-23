/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import Main from 'components/main';
import SectionHeader from 'components/section-header';
import { errorNotice, successNotice } from 'state/notices/actions';
import { sendTestOnboardingRequest } from 'state/onboarding/actions';

const NOTICE_SETTINGS = {
	duration: 8000,
	noticeId: 'jpo-site-title',
};

class OnboardingMain extends Component {
	state = {
		blogname: '',
		isSavingSettings: false,
	};

	handleFieldChange = fieldName => {
		return e => {
			this.setState( {
				[ fieldName ]: e.target.value,
			} );
		};
	};

	handleSubmitForm = () => {
		this.setState( {
			isSavingSettings: true,
		} );

		this.props.sendTestOnboardingRequest(
			{
				siteTitle: this.state.blogname,
			},
			this.onSaveSuccess,
			this.onSaveError
		);
	};

	onSaveSuccess = () => {
		const { translate } = this.props;

		this.setState( {
			isSavingSettings: false,
		} );

		this.props.successNotice( translate( 'Site title has been updated.' ), NOTICE_SETTINGS );
	};

	onSaveError = () => {
		const { translate } = this.props;

		this.setState( {
			isSavingSettings: false,
		} );

		this.props.errorNotice(
			translate( 'An error occurred while updating your site title.' ),
			NOTICE_SETTINGS
		);
	};

	render() {
		const { translate } = this.props;
		const { blogname, isSavingSettings } = this.state;
		return (
			<Main>
				<SectionHeader label={ translate( 'Jetpack Onboarding Testing' ) } />
				<Card>
					<FormFieldset>
						<FormLabel htmlFor="blogname">{ translate( 'Site Title' ) }</FormLabel>
						<FormInput
							name="blogname"
							id="blogname"
							data-tip-target="site-title-input"
							type="text"
							value={ blogname }
							onChange={ this.handleFieldChange( 'blogname' ) }
							disabled={ isSavingSettings }
						/>
					</FormFieldset>
					<Button
						onClick={ this.handleSubmitForm }
						primary={ true }
						data-tip-target="settings-site-profile-save"
						disabled={ isSavingSettings }
					>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				</Card>
			</Main>
		);
	}
}

export default connect( null, {
	errorNotice,
	sendTestOnboardingRequest,
	successNotice,
} )( localize( OnboardingMain ) );
