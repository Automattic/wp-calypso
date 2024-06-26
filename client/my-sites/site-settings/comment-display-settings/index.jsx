import { FormLabel } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

class CommentDisplaySettings extends Component {
	shouldEnableSettings() {
		const { isCommentsModuleActive, submittingForm } = this.props;
		return !! submittingForm || ! isCommentsModuleActive;
	}

	render() {
		const {
			fields,
			onChangeField,
			selectedSiteId,
			submittingForm,
			translate,
			isJetpack,
			handleAutosavingToggle,
		} = this.props;

		const commentsToggleLabel = translate(
			'Let visitors use a WordPress.com or Facebook account to comment.'
		);

		return (
			<FormFieldset className="comment-display-settings">
				<SupportInfo
					text={ translate(
						'Replaces the standard WordPress comment form with a new comment system ' +
							'that includes social media login options.'
					) }
					link="https://jetpack.com/support/comments/"
				/>
				{ isJetpack ? (
					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug="comments"
						label={ commentsToggleLabel }
						disabled={ !! submittingForm }
					/>
				) : (
					<span className="verbum-comments-toggle">
						<ToggleControl
							id={ `${ selectedSiteId }-verbum-comments-toggle` }
							checked={ !! fields.enable_verbum_commenting }
							onChange={ handleAutosavingToggle( 'enable_verbum_commenting' ) }
							disabled={ !! submittingForm }
							label={ commentsToggleLabel }
						/>
						<ToggleControl
							id={ `${ selectedSiteId }-verbum-comments-blocks-toggle` }
							checked={ !! fields.enable_blocks_comments }
							onChange={ handleAutosavingToggle( 'enable_blocks_comments' ) }
							disabled={ !! submittingForm || ! fields.enable_verbum_commenting }
							label={ translate( 'Enable blocks in comments.' ) }
						/>
					</span>
				) }
				<div className="comment-display-settings__module-setting is-indented">
					<FormLabel htmlFor="highlander_comment_form_prompt">
						{ translate( 'Comment form introduction' ) }
					</FormLabel>
					<FormTextInput
						name="highlander_comment_form_prompt"
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
						value={ fields.jetpack_comment_form_color_scheme || 'transparent' }
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
	const isJetpack = isJetpackSite( state, selectedSiteId );

	return {
		selectedSiteId,
		isCommentsModuleActive:
			!! isJetpackModuleActive( state, selectedSiteId, 'comments' ) || ! isJetpack,
	};
} )( localize( CommentDisplaySettings ) );
