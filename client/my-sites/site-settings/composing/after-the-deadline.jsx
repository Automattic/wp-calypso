/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FoldableCard from 'components/foldable-card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import TokenField from 'components/token-field';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isJetpackModuleActive,
	isJetpackModuleUnavailableInDevelopmentMode,
	isJetpackSiteInDevelopmentMode
} from 'state/selectors';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';

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

	onChangeIgnoredPhrases = ( phrases ) => {
		this.props.setFieldValue( 'ignored_phrases', phrases.join( ',' ) );
	};

	renderToggle( name, isDisabled, label ) {
		const {
			fields,
			handleToggle,
			isRequestingSettings,
			isSavingSettings,
			moduleUnavailable
		} = this.props;
		return (
			<CompactFormToggle
				checked={ !! fields[ name ] }
				disabled={ isRequestingSettings || isSavingSettings || isDisabled || moduleUnavailable }
				onChange={ handleToggle( name ) }
			>
				{ label }
			</CompactFormToggle>
		);
	}

	renderProofreadingSection() {
		const { afterTheDeadlineModuleActive, translate } = this.props;

		return (
			<FormFieldset>
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
			</FormFieldset>
		);
	}

	renderAutoLanguageDetectionSection() {
		const { afterTheDeadlineModuleActive, translate } = this.props;

		return (
			<FormFieldset>
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
			</FormFieldset>
		);
	}

	renderEnglishOptionsSection() {
		const { afterTheDeadlineModuleActive, translate } = this.props;

		return (
			<FormFieldset>
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
			</FormFieldset>
		);
	}

	renderIgnoredPhrasesSection() {
		const { afterTheDeadlineModuleActive, fields, moduleUnavailable, translate } = this.props;
		const ignoredPhrases = fields.ignored_phrases
			? fields.ignored_phrases.split( ',' )
			: [];

		return (
			<FormFieldset>
				<FormLegend>
					{ translate( 'Ignored Phrases' ) }
				</FormLegend>

				<TokenField
					onChange={ this.onChangeIgnoredPhrases }
					value={ ignoredPhrases }
					disabled={ ! afterTheDeadlineModuleActive || moduleUnavailable }
				/>
			</FormFieldset>
		);
	}

	render() {
		const {
			isRequestingSettings,
			isSavingSettings,
			moduleUnavailable,
			selectedSiteId,
			translate
		} = this.props;

		const atdToggle = (
			<JetpackModuleToggle
				siteId={ selectedSiteId }
				moduleSlug="after-the-deadline"
				label={ translate( 'Check your spelling, style, and grammar' ) }
				disabled={ isRequestingSettings || isSavingSettings || moduleUnavailable }
			/>
		);

		return (
			<FoldableCard className="composing__foldable-card site-settings__foldable-card" header={ atdToggle }>
				<QueryJetpackConnection siteId={ selectedSiteId } />

				<div className="composing__module-settings site-settings__child-settings">
					<div className="composing__info-link-container site-settings__info-link-container">
						<InfoPopover position={ 'left' }>
							<ExternalLink href={ 'https://jetpack.com/support/spelling-and-grammar/' } icon target="_blank">
								{ translate( 'Learn more about After the Deadline.' ) }
							</ExternalLink>
						</InfoPopover>
					</div>

					{ this.renderProofreadingSection() }
					{ this.renderAutoLanguageDetectionSection() }
					{ this.renderEnglishOptionsSection() }
					{ this.renderIgnoredPhrasesSection() }
				</div>
			</FoldableCard>
		);
	}
}

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
		const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode( state, selectedSiteId, 'after-the-deadline' );

		return {
			selectedSiteId,
			afterTheDeadlineModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'after-the-deadline' ),
			moduleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
		};
	}
)( localize( AfterTheDeadline ) );
