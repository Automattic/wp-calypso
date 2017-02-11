/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import JetpackModuleToggle from '../jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import TokenField from 'components/token-field';
import FormToggle from 'components/forms/form-toggle';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackModuleActive } from 'state/selectors';

class AfterTheDeadline extends Component {
	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {}
	};

	static propTypes = {
		handleToggle: PropTypes.func.isRequired,
		setFieldValue: PropTypes.func.isRequired,
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object,
	};

	state = {
		advancedOptionsVisible: false,
	};

	onChangeIgnoredPhrases = ( phrases ) => {
		this.props.setFieldValue( 'ignored_phrases', phrases.join( ',' ) );
	};

	onAdvancedOptionsClick = ( event ) => {
		event.preventDefault();

		this.setState( {
			advancedOptionsVisible: ! this.state.advancedOptionsVisible,
		} );
	};

	renderToggle( name, isDisabled, label ) {
		const {
			fields,
			handleToggle,
			isRequestingSettings,
			isSavingSettings
		} = this.props;
		return (
			<FormToggle
				className="composing__module-settings-toggle is-compact"
				checked={ !! fields[ name ] }
				disabled={ isRequestingSettings || isSavingSettings || isDisabled }
				onChange={ handleToggle( name ) }
			>
				{ label }
			</FormToggle>
		);
	}

	renderProofreadingSection() {
		const { afterTheDeadlineModuleActive, translate } = this.props;

		return (
			<div className="composing__module-settings site-settings__child-settings">
				<FormLegend>
					{ translate( 'Proofreading' ) }
				</FormLegend>
				<FormSettingExplanation>
					{ translate( 'Automatically proofread content when:' ) }
				</FormSettingExplanation>

				{
					this.renderToggle( 'onpublish', ! afterTheDeadlineModuleActive, translate(
						'Posts or pages are first published'
					) )
				}

				{
					this.renderToggle( 'onupdate', ! afterTheDeadlineModuleActive, translate(
						'Posts or pages are updated'
					) )
				}
			</div>
		);
	}

	renderAutoLanguageDetectionSection() {
		const { afterTheDeadlineModuleActive, translate } = this.props;

		return (
			<div className="composing__module-settings site-settings__child-settings">
				<FormLegend>
					{ translate( 'Automatic Language Detection' ) }
				</FormLegend>
				<FormSettingExplanation>
					{ translate( 'The proofreader supports English, French, German, Portuguese and Spanish.' ) }
				</FormSettingExplanation>

				{
					this.renderToggle( 'guess_lang', ! afterTheDeadlineModuleActive, translate(
						'Use automatically detected language to proofread posts and pages'
					) )
				}
			</div>
		);
	}

	renderEnglishOptionsSection() {
		const { afterTheDeadlineModuleActive, translate } = this.props;

		return (
			<div className="composing__module-settings site-settings__child-settings">
				<FormLegend>
					{ translate( 'English Options' ) }
				</FormLegend>
				<FormSettingExplanation>
					{ translate( 'Enable proofreading for the following grammar and style rules when writing posts and pages:' ) }
				</FormSettingExplanation>

				{ this.renderToggle( 'Bias Language', ! afterTheDeadlineModuleActive, translate( 'Bias Language' ) ) }
				{ this.renderToggle( 'Cliches', ! afterTheDeadlineModuleActive, translate( 'Clichés' ) ) }
				{ this.renderToggle( 'Complex Expression', ! afterTheDeadlineModuleActive, translate( 'Complex Phrases' ) ) }
				{ this.renderToggle( 'Diacritical Marks', ! afterTheDeadlineModuleActive, translate( 'Diacritical Marks' ) ) }
				{ this.renderToggle( 'Double Negative', ! afterTheDeadlineModuleActive, translate( 'Double Negatives' ) ) }
				{ this.renderToggle( 'Hidden Verbs', ! afterTheDeadlineModuleActive, translate( 'Hidden Verbs' ) ) }
				{ this.renderToggle( 'Jargon Language', ! afterTheDeadlineModuleActive, translate( 'Jargon' ) ) }
				{ this.renderToggle( 'Passive voice', ! afterTheDeadlineModuleActive, translate( 'Passive Voice' ) ) }
				{ this.renderToggle( 'Phrases to Avoid', ! afterTheDeadlineModuleActive, translate( 'Phrases to Avoid' ) ) }
				{ this.renderToggle( 'Redundant Expression', ! afterTheDeadlineModuleActive, translate( 'Redundant Phrases' ) ) }
			</div>
		);
	}

	renderIgnoredPhrasesSection() {
		const { afterTheDeadlineModuleActive, fields, translate } = this.props;
		const ignoredPhrases = fields.ignored_phrases
			? fields.ignored_phrases.split( ',' )
			: [];

		return (
			<div className="composing__module-settings site-settings__child-settings">
				<FormLegend>
					{ translate( 'Ignored Phrases' ) }
				</FormLegend>

				<TokenField
					onChange={ this.onChangeIgnoredPhrases }
					value={ ignoredPhrases }
					disabled={ ! afterTheDeadlineModuleActive }
				/>
			</div>
		);
	}

	render() {
		const {
			isRequestingSettings,
			isSavingSettings,
			selectedSiteId,
			translate
		} = this.props;

		return (
			<FormFieldset>
				<div className="composing__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink href={ 'https://jetpack.com/support/spelling-and-grammar/' } target="_blank">
							{ translate( 'Learn more about After the Deadline' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="after-the-deadline"
					label={ translate( 'Check your spelling, style, and grammar.' ) }
					disabled={ isRequestingSettings || isSavingSettings }
					/>

				<a href="#" onClick={ this.onAdvancedOptionsClick }>
					{ translate( 'Advanced Options' ) }
				</a>

				{ this.state.advancedOptionsVisible && (
					<div>
						{ this.renderProofreadingSection() }
						{ this.renderAutoLanguageDetectionSection() }
						{ this.renderEnglishOptionsSection() }
						{ this.renderIgnoredPhrasesSection() }
					</div>
				) }
			</FormFieldset>
		);
	}
}

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			selectedSiteId,
			afterTheDeadlineModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'after-the-deadline' ),
		};
	}
)( localize( AfterTheDeadline ) );
