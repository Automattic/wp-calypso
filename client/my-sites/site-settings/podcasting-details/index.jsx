import {
	PLAN_PERSONAL,
	WPCOM_FEATURES_UPLOAD_AUDIO_FILES,
	getPlan,
} from '@automattic/calypso-products';
import { Button, Card, FormLabel } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { pick, flowRight } from 'lodash';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import TermTreeSelector from 'calypso/blocks/term-tree-selector';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import DocumentHead from 'calypso/components/data/document-head';
import QueryTerms from 'calypso/components/data/query-terms';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import { decodeEntities } from 'calypso/lib/formatting';
import scrollTo from 'calypso/lib/scroll-to';
import PodcastCoverImageSetting from 'calypso/my-sites/site-settings/podcast-cover-image-setting';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import { isSavingSiteSettings } from 'calypso/state/site-settings/selectors';
import { isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { isRequestingTermsForQueryIgnoringPage } from 'calypso/state/terms/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import PodcastFeedUrl from './feed-url';
import PodcastingNoPermissionsMessage from './no-permissions';
import PodcastingNotSupportedMessage from './not-supported';
import PodcastingPrivateSiteMessage from './private-site';
import PodcastingPublishNotice from './publish-notice';
import TopicsSelector from './topics-selector';

/**
 * Selectors, actions, and query components
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
		const { fields, handleSelect, isRequestingSettings, translate, isPodcastingEnabled } =
			this.props;

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

	renderSaveButton( largeButton ) {
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
				compact={ ! largeButton }
				onClick={ handleSubmitForm }
				primary
				type="submit"
				disabled={ saveButtonDisabled }
				busy={ isSavingSettings }
				className="podcasting-details__save-button"
			>
				{ saveButtonText }
			</Button>
		);
	}

	renderTextField( { FormComponent = FormInput, key, label, explanation, isDisabled = false } ) {
		const { fields, isRequestingSettings, onChangeField, isPodcastingEnabled } = this.props;

		return (
			<FormFieldset>
				<FormLabel htmlFor={ key }>{ label }</FormLabel>
				{ explanation && <FormSettingExplanation>{ explanation }</FormSettingExplanation> }
				<FormComponent
					id={ key }
					name={ key }
					value={ decodeEntities( fields[ key ] ) || '' }
					onChange={ onChangeField( key ) }
					disabled={ isDisabled || isRequestingSettings || ! isPodcastingEnabled }
				/>
			</FormFieldset>
		);
	}

	renderTopicSelector( key ) {
		const { fields, handleSelect, isRequestingSettings, isPodcastingEnabled } = this.props;
		return (
			<TopicsSelector
				id={ key }
				name={ key }
				onChange={ handleSelect }
				value={ fields[ key ] || 0 }
				disabled={ isRequestingSettings || ! isPodcastingEnabled }
			/>
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

		const classes = clsx( 'podcasting-details__wrapper', {
			'is-disabled': ! error && ! isPodcastingEnabled,
		} );

		return (
			<Main>
				<DocumentHead title={ translate( 'Podcasting' ) } />
				<NavigationHeader
					navigationItems={ [] }
					title={ translate( 'Podcasting' ) }
					subtitle={ translate(
						'Publish a podcast feed to Apple Podcasts and other podcasting services. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="podcasting" showIcon={ false } />,
							},
						}
					) }
				/>

				<form id="site-settings" onSubmit={ handleSubmitForm }>
					{ ! error && plansDataLoaded && (
						<UpsellNudge
							plan={ PLAN_PERSONAL }
							title={ translate( 'Upload Audio with WordPress.com %(personalPlanName)s', {
								args: { personalPlanName: getPlan( PLAN_PERSONAL ).getTitle() },
							} ) }
							description={ translate(
								'Embed podcast episodes directly from your media library.'
							) }
							feature={ WPCOM_FEATURES_UPLOAD_AUDIO_FILES }
							event="podcasting_details_upload_audio"
							tracksImpressionName="calypso_upgrade_nudge_impression"
							tracksClickName="calypso_upgrade_nudge_cta_click"
							showIcon
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
			</Main>
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
						key="category"
						selected={ podcastingCategoryId ? [ podcastingCategoryId ] : [] }
						podcastingCategoryId={ podcastingCategoryId }
						onChange={ this.onCategorySelected }
						addTerm
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
						FormComponent: FormTextarea,
						key: 'podcasting_summary',
						label: translate( 'Summary/Description' ),
					} ) }
				</div>
				{ this.renderTopics() }
				{ this.renderExplicitContent() }
				{ this.renderTextField( {
					key: 'podcasting_talent_name',
					label: translate( 'Hosts/Artist/Producer' ),
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
				{ isPodcastingEnabled && this.renderSaveButton( true ) }
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
		'podcasting_talent_name',
		'podcasting_summary',
		'podcasting_copyright',
		'podcasting_explicit',
		'podcasting_image',
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
