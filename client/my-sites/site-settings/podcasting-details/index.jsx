/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { map, toPairs, pick, flowRight } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { PLAN_PERSONAL, FEATURE_AUDIO_UPLOADS } from 'lib/plans/constants';
import wrapSettingsForm from 'my-sites/site-settings/wrap-settings-form';
import { decodeEntities } from 'lib/formatting';
import scrollTo from 'lib/scroll-to';
import { isRequestingSitePlans } from 'state/sites/plans/selectors';
import { Button, Card } from '@automattic/components';
import DocumentHead from 'components/data/document-head';
import FormFieldset from 'components/forms/form-fieldset';
import FormInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormSelect from 'components/forms/form-select';
import FormTextarea from 'components/forms/form-textarea';
import HeaderCake from 'components/header-cake';
import Notice from 'components/notice';
import PodcastCoverImageSetting from 'my-sites/site-settings/podcast-cover-image-setting';
import PodcastFeedUrl from './feed-url';
import PodcastingPrivateSiteMessage from './private-site';
import PodcastingNoPermissionsMessage from './no-permissions';
import PodcastingNotSupportedMessage from './not-supported';
import PodcastingPublishNotice from './publish-notice';
import PodcastingSupportLink from './support-link';
import podcastingTopics from './topics';
import TermTreeSelector from 'blocks/term-tree-selector';
import UpsellNudge from 'blocks/upsell-nudge';

/**
 * Selectors, actions, and query components
 */
import QueryTerms from 'components/data/query-terms';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isPrivateSite from 'state/selectors/is-private-site';
import isSiteComingSoon from 'state/selectors/is-site-coming-soon';
import canCurrentUser from 'state/selectors/can-current-user';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'state/sites/selectors';
import { isRequestingTermsForQueryIgnoringPage } from 'state/terms/selectors';
import { isSavingSiteSettings } from 'state/site-settings/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class PodcastingDetails extends Component {
	constructor() {
		super();
		this.state = {
			isCoverImageUploading: false,
		};
	}

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
		const { isCoverImageUploading } = this.state;

		const saveButtonDisabled =
			isRequestingSettings || isSavingSettings || isRequestingCategories || isCoverImageUploading;
		let saveButtonText;
		if ( isCoverImageUploading ) {
			saveButtonText = translate( 'Image uploading…' );
		} else if ( isSavingSettings ) {
			saveButtonText = translate( 'Saving…' );
		} else {
			saveButtonText = translate( 'Save Settings' );
		}

		return (
			<Button
				compact={ true }
				onClick={ handleSubmitForm }
				primary={ true }
				type="submit"
				disabled={ saveButtonDisabled }
				busy={ isSavingSettings }
			>
				{ saveButtonText }
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
					// The keys for podcasting in Apple Podcasts use &amp;
					const topicKey = topic.replace( '&', '&amp;' );
					return [
						<option key={ topicKey } value={ topicKey }>
							{ topic }
						</option>,
						...map( subtopics, ( subtopic ) => {
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
						'Choose how your podcast should be categorized within Apple Podcasts and other podcasting services.'
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
			translate,
			isPodcastingEnabled,
			isSavingSettings,
			plansDataLoaded,
		} = this.props;
		const { isCoverImageUploading } = this.state;

		if ( ! siteId ) {
			return null;
		}

		const error = this.renderSettingsError();
		const writingHref = `/settings/writing/${ siteSlug }`;

		const classes = classNames( 'podcasting-details__wrapper', {
			'is-disabled': ! error && ! isPodcastingEnabled,
		} );

		return (
			<div
				className="main main-column" // eslint-disable-line
				role="main"
			>
				<DocumentHead title={ translate( 'Podcasting Settings' ) } />
				<form id="site-settings" onSubmit={ handleSubmitForm }>
					<HeaderCake
						actionButton={ error ? null : this.renderSaveButton() }
						backHref={ writingHref }
						backText={ translate( 'Writing' ) }
					>
						<h1>
							{ translate( 'Podcasting Settings' ) }
							<PodcastingSupportLink showText={ false } iconSize={ 16 } />
						</h1>
					</HeaderCake>
					{ ! error && plansDataLoaded && (
						<UpsellNudge
							plan={ PLAN_PERSONAL }
							title={ translate( 'Upload Audio with WordPress.com Personal' ) }
							description={ translate(
								'Embed podcast episodes directly from your media library.'
							) }
							feature={ FEATURE_AUDIO_UPLOADS }
							event="podcasting_details_upload_audio"
							tracksImpressionName="calypso_upgrade_nudge_impression"
							tracksClickName="calypso_upgrade_nudge_cta_click"
							showIcon={ true }
						/>
					) }
					{ ! error && (
						<Card className="podcasting-details__category-wrapper">
							{ this.renderCategorySetting() }
						</Card>
					) }
					<Card className={ classes }>{ error || this.renderSettings() }</Card>
					{ isPodcastingEnabled && (
						<div className="podcasting-details__disable-podcasting">
							<Button
								onClick={ this.onCategoryCleared }
								scary
								busy={ isSavingSettings }
								disabled={ isCoverImageUploading }
							>
								{ translate( 'Disable Podcast' ) }
							</Button>
							<p>
								{ translate(
									'Disable to stop publishing your podcast feed. You can always set it up again.'
								) }
							</p>
						</div>
					) }
				</form>
			</div>
		);
	}

	renderCategorySetting() {
		const {
			siteId,
			isPodcastingEnabled,
			podcastingCategoryId,
			isCategoryChanging,
			translate,
			newPostUrl,
		} = this.props;

		return (
			<Fragment>
				<QueryTerms siteId={ siteId } taxonomy="category" />
				<FormFieldset>
					{ isPodcastingEnabled && (
						<div className="podcasting-details__publish-wrapper">
							<PodcastingPublishNotice podcastingCategoryId={ podcastingCategoryId } />
							<Button className="podcasting-details__publish-button" href={ newPostUrl }>
								{ translate( 'Create Episode' ) }
							</Button>
						</div>
					) }
					<FormLabel>{ translate( 'Podcast Category' ) }</FormLabel>
					<FormSettingExplanation>
						{ translate(
							'Posts published in this category will be included in your podcast feed.'
						) }
					</FormSettingExplanation>
					<TermTreeSelector
						taxonomy="category"
						selected={ podcastingCategoryId ? [ podcastingCategoryId ] : [] }
						podcastingCategoryId={ podcastingCategoryId }
						onChange={ this.onCategorySelected }
						addTerm={ true }
						onAddTermSuccess={ this.onCategorySelected }
						height={ 200 }
					/>
					{ isCategoryChanging && (
						<Notice
							isCompact
							status="is-info"
							text={ translate(
								"If you change categories, you'll need to resubmit your feed to Apple Podcasts and any other podcasting services."
							) }
						/>
					) }
				</FormFieldset>
				<PodcastFeedUrl categoryId={ podcastingCategoryId } />
			</Fragment>
		);
	}

	renderSettings() {
		const { translate, fields, isPodcastingEnabled } = this.props;

		return (
			<Fragment>
				<PodcastCoverImageSetting
					coverImageId={ parseInt( fields.podcasting_image_id, 10 ) || 0 }
					coverImageUrl={ fields.podcasting_image }
					onRemove={ this.onCoverImageRemoved }
					onSelect={ this.onCoverImageSelected }
					onUploadStateChange={ this.onCoverImageUploadStateChanged }
					isDisabled={ ! isPodcastingEnabled }
				/>
				<div className="podcasting-details__title-subtitle-wrapper">
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
			</Fragment>
		);
	}

	renderSettingsError() {
		// If there is a reason that we can't display the podcasting settings
		// screen, it will be rendered here.
		const { isPrivate, isComingSoon, isUnsupportedSite, userCanManagePodcasting } = this.props;

		if ( isPrivate ) {
			return <PodcastingPrivateSiteMessage isComingSoon={ isComingSoon } />;
		}

		if ( ! userCanManagePodcasting ) {
			return <PodcastingNoPermissionsMessage />;
		}

		if ( isUnsupportedSite ) {
			return <PodcastingNotSupportedMessage />;
		}

		return null;
	}

	onCategorySelected = ( category ) => {
		const { settings, fields, isPodcastingEnabled } = this.props;

		const fieldsToUpdate = { podcasting_category_id: String( category.ID ) };

		if ( ! isPodcastingEnabled ) {
			// If we are newly enabling podcasting, and no podcast title is set,
			// use the site title.
			if ( ! fields.podcasting_title ) {
				fieldsToUpdate.podcasting_title = settings.blogname;
			}
			// If we are newly enabling podcasting, and no podcast subtitle is set,
			// use the site description.
			if ( ! fields.podcasting_subtitle ) {
				fieldsToUpdate.podcasting_subtitle = settings.blogdescription;
			}
		}

		this.props.updateFields( fieldsToUpdate );
	};

	onCategoryCleared = () => {
		const { updateFields, submitForm } = this.props;

		updateFields( { podcasting_category_id: '0' }, () => {
			submitForm();
			scrollTo( { y: 0 } );
		} );
	};

	onCoverImageRemoved = () => {
		this.props.updateFields( {
			podcasting_image_id: '0',
			podcasting_image: '',
		} );
	};

	onCoverImageSelected = ( coverId, coverUrl ) => {
		this.props.updateFields( {
			podcasting_image_id: String( coverId ),
			podcasting_image: coverUrl,
		} );
	};

	onCoverImageUploadStateChanged = ( isUploading ) => {
		this.setState( {
			isCoverImageUploading: isUploading,
		} );
	};
}

const getFormSettings = ( settings ) => {
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
		'podcasting_image_id',
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

	const isSavingSettings = isSavingSiteSettings( state, siteId );
	const isCategoryChanging =
		! isSavingSettings &&
		! ownProps.isRequestingSettings &&
		ownProps.settings &&
		Number( ownProps.settings.podcasting_category_id ) > 0 &&
		podcastingCategoryId !== Number( ownProps.settings.podcasting_category_id );

	const isJetpack = isJetpackSite( state, siteId );
	const isAutomatedTransfer = isSiteAutomatedTransfer( state, siteId );

	const siteSlug = getSelectedSiteSlug( state );
	const newPostUrl = `/post/${ siteSlug }`;

	return {
		siteId,
		siteSlug,
		isPrivate: isPrivateSite( state, siteId ),
		isComingSoon: isSiteComingSoon( state, siteId ),
		isPodcastingEnabled,
		podcastingCategoryId,
		isCategoryChanging,
		isRequestingCategories: isRequestingTermsForQueryIgnoringPage( state, siteId, 'category', {} ),
		userCanManagePodcasting: canCurrentUser( state, siteId, 'manage_options' ),
		isUnsupportedSite: isJetpack && ! isAutomatedTransfer,
		isSavingSettings,
		newPostUrl,
		plansDataLoaded: ! isRequestingSitePlans( state, siteId ),
	};
} );

export default flowRight(
	wrapSettingsForm( getFormSettings ),
	connectComponent
)( localize( PodcastingDetails ) );
