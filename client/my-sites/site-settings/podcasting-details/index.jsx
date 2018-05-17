/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { map, toPairs, pick, flowRight } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import FormFieldset from 'components/forms/form-fieldset';
import FormInput from 'components/forms/form-text-input';
import { decodeEntities } from 'lib/formatting';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormSelect from 'components/forms/form-select';
import FormTextarea from 'components/forms/form-textarea';
import HeaderCake from 'components/header-cake';
import QueryTerms from 'components/data/query-terms';
import TermTreeSelector from 'blocks/term-tree-selector';
import PodcastCoverImage from 'blocks/podcast-cover-image';
import wrapSettingsForm from 'my-sites/site-settings/wrap-settings-form';
import podcastingTopics from './topics';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isRequestingTermsForQueryIgnoringPage } from 'state/terms/selectors';

class PodcastingDetails extends Component {
	renderExplicitContent() {
		const {
			fields,
			handleSelect,
			isRequestingSettings,
			translate,
			isPodcastingEnabled,
		} = this.props;

		return (
			<FormFieldset>
				<FormLabel htmlFor="podcasting_explicit">{ translate( 'Explicit Content' ) }</FormLabel>
				<FormSelect
					id="podcasting_explicit"
					name="podcasting_explicit"
					onChange={ handleSelect }
					value={ fields.podcasting_explicit || 'no' }
					disabled={ isRequestingSettings || ! isPodcastingEnabled }
				>
					<option value="no">{ translate( 'No' ) }</option>
					<option value="yes">{ translate( 'Yes' ) }</option>
					<option value="clean">{ translate( 'Clean' ) }</option>
				</FormSelect>
			</FormFieldset>
		);
	}

	renderSaveButton() {
		const {
			handleSubmitForm,
			isRequestingSettings,
			isSavingSettings,
			isRequestingCategories,
			translate,
		} = this.props;
		return (
			<Button
				compact={ true }
				onClick={ handleSubmitForm }
				primary={ true }
				type="submit"
				disabled={ isRequestingSettings || isSavingSettings || isRequestingCategories }
			>
				{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
			</Button>
		);
	}

	renderTextField( { FormComponent = FormInput, key, label, explanation } ) {
		const { fields, isRequestingSettings, onChangeField, isPodcastingEnabled } = this.props;

		return (
			<FormFieldset>
				<FormLabel htmlFor={ key }>{ label }</FormLabel>
				{ explanation && <FormSettingExplanation>{ explanation }</FormSettingExplanation> }
				<FormComponent
					id={ key }
					name={ key }
					type="text"
					value={ decodeEntities( fields[ key ] ) || '' }
					onChange={ onChangeField( key ) }
					disabled={ isRequestingSettings || ! isPodcastingEnabled }
				/>
			</FormFieldset>
		);
	}

	renderTopicSelector( key ) {
		const { fields, handleSelect, isRequestingSettings, isPodcastingEnabled } = this.props;
		return (
			<FormSelect
				id={ key }
				name={ key }
				onChange={ handleSelect }
				value={ fields[ key ] || 0 }
				disabled={ isRequestingSettings || ! isPodcastingEnabled }
			>
				<option value="0">None</option>
				{ map( toPairs( podcastingTopics ), ( [ topic, subtopics ] ) => {
					// The keys for podcasting in iTunes use &amp;
					const topicKey = topic.replace( '&', '&amp;' );
					return [
						<option key={ topicKey } value={ topicKey }>
							{ topic }
						</option>,
						...map( subtopics, subtopic => {
							const subtopicKey = topicKey + ',' + subtopic.replace( '&', '&amp;' );
							return (
								<option key={ subtopicKey } value={ subtopicKey }>
									{ topic } » { subtopic }
								</option>
							);
						} ),
					];
				} ) }
			</FormSelect>
		);
	}

	renderTopics() {
		const { translate } = this.props;

		return (
			<FormFieldset>
				<FormLabel htmlFor="podcasting_category_1">{ translate( 'Podcast Topics' ) }</FormLabel>
				<FormSettingExplanation>
					{ translate(
						'Choose how your podcast should be categorized within iTunes and other podcasting services.'
					) }
				</FormSettingExplanation>
				{ this.renderTopicSelector( 'podcasting_category_1' ) }
				{ this.renderTopicSelector( 'podcasting_category_2' ) }
				{ this.renderTopicSelector( 'podcasting_category_3' ) }
			</FormFieldset>
		);
	}

	render() {
		const {
			handleSubmitForm,
			siteSlug,
			siteId,
			podcastingCategoryId,
			translate,
			isPodcastingEnabled,
		} = this.props;
		if ( ! siteId ) {
			return null;
		}

		const classes = classNames( 'podcasting-details__wrapper', {
			'is-disabled': ! isPodcastingEnabled,
		} );

		const writingHref = `/settings/writing/${ siteSlug }`;

		return (
			<div
				className="main main-column" // eslint-disable-line
				role="main"
			>
				<DocumentHead title={ translate( 'Podcasting Settings' ) } />
				<form id="site-settings" onSubmit={ handleSubmitForm }>
					<HeaderCake
						actionButton={ this.renderSaveButton() }
						backHref={ writingHref }
						backText={ translate( 'Writing' ) }
					>
						<h1>{ translate( 'Podcasting Settings' ) }</h1>
					</HeaderCake>
					<Card className={ classes }>
						<FormFieldset className="podcasting-details__category-selector">
							<QueryTerms siteId={ siteId } taxonomy="category" />
							<FormLabel>{ translate( 'Podcast Category' ) }</FormLabel>
							<FormSettingExplanation>
								{ translate(
									'Posts published in this category will be included in your podcast feed.'
								) }
							</FormSettingExplanation>
							<TermTreeSelector
								taxonomy="category"
								selected={ podcastingCategoryId ? [ podcastingCategoryId ] : [] }
								onChange={ this.onCategorySelected }
								addTerm={ true }
								onAddTermSuccess={ this.onCategorySelected }
								height={ 200 }
							/>
							{ isPodcastingEnabled && (
								<Button onClick={ this.onCategoryCleared } scary>
									{ translate( 'Disable Podcast' ) }
								</Button>
							) }
						</FormFieldset>
						<div className="podcasting-details__basic-settings">
							<FormFieldset className="podcasting-details__cover-image">
								<FormLabel>{ translate( 'Podcast Cover Image' ) }</FormLabel>
								<PodcastCoverImage size={ 96 } />
							</FormFieldset>
							{ this.renderTextField( {
								key: 'podcasting_title',
								label: translate( 'Title' ),
							} ) }
							{ this.renderTextField( {
								key: 'podcasting_subtitle',
								label: translate( 'Subtitle' ),
							} ) }
						</div>
						{ this.renderTopics() }
						{ this.renderExplicitContent() }
						{ this.renderTextField( {
							key: 'podcasting_talent_name',
							label: translate( 'Hosts/Artist/Producer' ),
						} ) }
						{ this.renderTextField( {
							FormComponent: FormTextarea,
							key: 'podcasting_summary',
							label: translate( 'Summary' ),
						} ) }
						{ this.renderTextField( {
							key: 'podcasting_email',
							label: translate( 'Email Address' ),
							explanation: translate(
								'This email address will be displayed in the feed and is required for some services such as Google Play.'
							),
						} ) }
						{ this.renderTextField( {
							key: 'podcasting_copyright',
							label: translate( 'Copyright' ),
						} ) }
						{ this.renderTextField( {
							key: 'podcasting_keywords',
							label: translate( 'Keywords' ),
						} ) }
					</Card>
				</form>
			</div>
		);
	}

	onCategorySelected = category => {
		this.setPodcastingCategoryId( category.ID );
	};

	onCategoryCleared = () => {
		this.setPodcastingCategoryId( 0 );
	};

	setPodcastingCategoryId = newCategoryId => {
		const { onChangeField } = this.props;

		// Always send and save category IDs as strings because this is what
		// the settings form wrapper expects (otherwise the settings form will
		// be marked dirty again immediately after saving).
		const event = { target: { value: String( newCategoryId ) } };

		onChangeField( 'podcasting_category_id' )( event );
	};
}

const getFormSettings = settings => {
	return pick( settings, [
		'podcasting_category_id',
		'podcasting_title',
		'podcasting_subtitle',
		'podcasting_talent_name',
		'podcasting_summary',
		'podcasting_copyright',
		'podcasting_explicit',
		'podcasting_image',
		'podcasting_keywords',
		'podcasting_category_1',
		'podcasting_category_2',
		'podcasting_category_3',
		'podcasting_email',
	] );
};

const connectComponent = connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	// The settings form wrapper gives us a string here, but inside this
	// component, we always want to work with a number.
	const podcastingCategoryId =
		ownProps.fields &&
		ownProps.fields.podcasting_category_id &&
		Number( ownProps.fields.podcasting_category_id );
	const isPodcastingEnabled = podcastingCategoryId > 0;

	return {
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		podcastingCategoryId,
		isPodcastingEnabled,
		isRequestingCategories: isRequestingTermsForQueryIgnoringPage( state, siteId, 'category', {} ),
	};
} );

export default flowRight( wrapSettingsForm( getFormSettings ), connectComponent )(
	localize( PodcastingDetails )
);
