/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight, map, pick, toPairs } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import FormFieldset from 'components/forms/form-fieldset';
import FormInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormTextarea from 'components/forms/form-textarea';
import HeaderCake from 'components/header-cake';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import wrapSettingsForm from 'my-sites/site-settings/wrap-settings-form';
import categories from './categories';

class PodcastDetails extends Component {
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
		const { handleSubmitForm, isRequestingSettings, isSavingSettings, translate } = this.props;
		return (
			<Button
				compact={ true }
				onClick={ handleSubmitForm }
				primary={ true }
				type="submit"
				disabled={ isRequestingSettings || isSavingSettings }
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
					value={ fields[ key ] || '' }
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
				{ map( toPairs( categories ), ( [ category, subcategories ] ) => {
					// The keys for podcasting in iTunes use &amp;
					const catKey = category.replace( '&', '&amp;' );
					return [
						<option key={ catKey } value={ catKey }>
							{ category }
						</option>,
						...map( subcategories, subcategory => {
							const subcatKey = catKey + ',' + subcategory.replace( '&', '&amp;' );
							return (
								<option key={ subcatKey } value={ subcatKey }>
									{ category } » { subcategory }
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
				{ this.renderTopicSelector( 'podcasting_category_1' ) }
				{ this.renderTopicSelector( 'podcasting_category_2' ) }
				{ this.renderTopicSelector( 'podcasting_category_3' ) }
			</FormFieldset>
		);
	}

	render() {
		const { handleSubmitForm, siteSlug, translate } = this.props;
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
					<Card>
						{ this.renderTextField( {
							key: 'podcasting_title',
							label: translate( 'Title' ),
						} ) }
						{ this.renderTextField( {
							key: 'podcasting_subtitle',
							label: translate( 'Subtitle' ),
						} ) }
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

const connectComponent = connect( state => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
} );

export default flowRight( connectComponent, wrapSettingsForm( getFormSettings ) )(
	localize( PodcastDetails )
);
