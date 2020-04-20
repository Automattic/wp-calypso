/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import SupportInfo from 'components/support-info';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class CommentDisplaySettings extends Component {
	shouldEnableSettings() {
		const { isCommentsModuleActive, submittingForm } = this.props;
		return !! submittingForm || ! isCommentsModuleActive;
	}

	render() {
		const { fields, onChangeField, selectedSiteId, submittingForm, translate } = this.props;

		return (
			<FormFieldset className="comment-display-settings">
				<SupportInfo
					text={ translate(
						'Replaces the standard WordPress comment form with a new comment system ' +
							'that includes social media login options.'
					) }
					link="https://jetpack.com/support/comments/"
				/>
				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="comments"
					label={ translate(
						'Let visitors use a WordPress.com, Twitter, Facebook, or Google account to comment.'
					) }
					disabled={ !! submittingForm }
				/>
				<div className="comment-display-settings__module-setting is-indented">
					<FormLabel htmlFor="highlander_comment_form_prompt">
						{ translate( 'Comment form introduction' ) }
					</FormLabel>
					<FormTextInput
						name="highlander_comment_form_prompt"
						type="text"
						id="highlander_comment_form_prompt"
						value={ fields.highlander_comment_form_prompt || '' }
						onChange={ onChangeField( 'highlander_comment_form_prompt' ) }
						disabled={ this.shouldEnableSettings() }
					/>
					<FormSettingExplanation>
						{ translate( 'A few catchy words to motivate your readers to comment.' ) }
					</FormSettingExplanation>
				</div>
				<div className="comment-display-settings__module-setting is-indented">
					<FormLabel htmlFor="jetpack_comment_form_color_scheme">
						{ translate( 'Color Scheme' ) }
					</FormLabel>
					<FormSelect
						name="jetpack_comment_form_color_scheme"
						value={ fields.jetpack_comment_form_color_scheme || 'light' }
						onChange={ onChangeField( 'jetpack_comment_form_color_scheme' ) }
						disabled={ this.shouldEnableSettings() }
					>
						<option value="light">{ translate( 'Light' ) }</option>
						<option value="dark">{ translate( 'Dark' ) }</option>
						<option value="transparent">{ translate( 'Transparent' ) }</option>
					</FormSelect>
				</div>
			</FormFieldset>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		selectedSiteId,
		isCommentsModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'comments' ),
	};
} )( localize( CommentDisplaySettings ) );
