/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { map, toPairs, pick, get, find, flowRight } from 'lodash';

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
import wrapSettingsForm from 'my-sites/site-settings/wrap-settings-form';
import podcastingTopics from './topics';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getTerms, isRequestingTermsForQueryIgnoringPage } from 'state/terms/selectors';

class PodcastingDetails extends Component {
	renderExplicitContent() {
		const { fields, handleSelect, isRequestingSettings, translate } = this.props;

		return (
			<FormFieldset>
				<FormLabel htmlFor="podcasting_explicit">{ translate( 'Explicit Content' ) }</FormLabel>
				<FormSelect
					id="podcasting_explicit"
					name="podcasting_explicit"
					onChange={ handleSelect }
					value={ fields.podcasting_explicit || 'no' }
					disabled={ isRequestingSettings }
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

	renderTextField( { FormComponent = FormInput, key, label } ) {
		const { fields, isRequestingSettings, onChangeField } = this.props;

		return (
			<FormFieldset>
				<FormLabel htmlFor={ key }>{ label }</FormLabel>
				<FormComponent
					id={ key }
					name={ key }
					type="text"
					value={ decodeEntities( fields[ key ] ) || '' }
					onChange={ onChangeField( key ) }
					disabled={ isRequestingSettings }
				/>
			</FormFieldset>
		);
	}

	renderTopicSelector( key ) {
		const { fields, handleSelect, isRequestingSettings } = this.props;
		return (
			<FormSelect
				id={ key }
				name={ key }
				onChange={ handleSelect }
				value={ fields[ key ] || 0 }
				disabled={ isRequestingSettings }
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
		const { handleSubmitForm, siteSlug, siteId, podcastingCategoryId, translate } = this.props;
		if ( ! siteId ) {
			return null;
		}

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
					<Card className="podcasting-details__wrapper">
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
							/>
						</FormFieldset>
						<div className="podcasting-details__basic-settings">
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
		const { onChangeField } = this.props;

		const event = { target: { value: category.slug } };

		onChangeField( 'podcasting_archive' )( event );
	};
}

const getFormSettings = settings => {
	return pick( settings, [
		'podcasting_archive',
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
	] );
};

const connectComponent = connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	let podcastingCategoryId = null;

	// Retrieve podcasting category ID from saved category slug (if any)
	const podcastingCategorySlug = get( ownProps.fields, 'podcasting_archive' );
	if ( podcastingCategorySlug && podcastingCategorySlug !== '0' ) {
		const categories = getTerms( state, siteId, 'category' );
		if ( categories && categories.length ) {
			// This is not a bound selector
			// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
			const podcastingCategory = find( categories, c => c.slug === podcastingCategorySlug );
			if ( podcastingCategory ) {
				podcastingCategoryId = podcastingCategory.ID;
			}
		}
	}

	return {
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		podcastingCategoryId,
		isRequestingCategories: isRequestingTermsForQueryIgnoringPage( state, siteId, 'category', {} ),
	};
} );

export default flowRight( wrapSettingsForm( getFormSettings ), connectComponent )(
	localize( PodcastingDetails )
);
