import {
	PLAN_PERSONAL,
	WPCOM_FEATURES_UPLOAD_AUDIO_FILES,
	getPlan,
} from '@automattic/calypso-products';
import { Button, Card, FormLabel } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { pick } from 'lodash';
import { useState, useCallback } from 'react';
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
import PodcastCoverImageSetting from 'calypso/my-sites/site-settings/podcast-cover-image-setting';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import { hasLoadedSitePlansFromServer } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import PodcastFeedUrl from './feed-url';
import PodcastingNoPermissionsMessage from './no-permissions';
import PodcastingNotSupportedMessage from './not-supported';
import PodcastingPrivateSiteMessage from './private-site';
import PodcastingPublishNotice from './publish-notice';
import TopicsSelector from './topics-selector';

import './style.scss';

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

const PodcastingSettingsForm = wrapSettingsForm( getFormSettings )( ( {
	fields,
	handleSubmitForm,
	handleSelect,
	isRequestingSettings,
	isSavingSettings,
	onChangeField,
	settings,
	updateFields,
	submitForm,
} ) => {
	const translate = useTranslate();
	const [ isCoverImageUploading, setIsCoverImageUploading ] = useState( false );
	const [ isEnabling, setIsEnabling ] = useState( false );

	const siteId = useSelector( getSelectedSiteId );
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAutomatedTransfer = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isPrivate = useSelector( ( state ) => isPrivateSite( state, siteId ) );
	const isComingSoon = useSelector( ( state ) => isSiteComingSoon( state, siteId ) );
	const userCanManagePodcasting = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'manage_options' )
	);
	const isUnsupportedSite = isJetpack && ! isAutomatedTransfer;
	const plansDataLoaded = useSelector( ( state ) => hasLoadedSitePlansFromServer( state, siteId ) );

	const podcastingCategoryId = fields.podcasting_category_id
		? Number( fields.podcasting_category_id )
		: 0;
	const isPodcastingEnabled = podcastingCategoryId > 0;

	const isCategoryChanging =
		! isSavingSettings &&
		! isRequestingSettings &&
		settings &&
		Number( settings.podcasting_category_id ) > 0 &&
		podcastingCategoryId !== Number( settings.podcasting_category_id );

	const isAudioUploadEnabled =
		plansDataLoaded && ( site?.options?.upgraded_filetypes_enabled || isJetpack );

	const disabled = isRequestingSettings || isSavingSettings || isCoverImageUploading;

	const newPostUrl = `/post/${ siteSlug }`;

	const onTogglePodcasting = useCallback(
		( isEnabled ) => {
			if ( disabled ) {
				return;
			}

			if ( isEnabled ) {
				// Show settings so the user can pick a category and fill in details.
				// Pre-fill the title from the site name if not already set.
				setIsEnabling( true );
				if ( ! fields.podcasting_title ) {
					updateFields( { podcasting_title: settings?.blogname || '' } );
				}
			} else {
				setIsEnabling( false );
				if ( isPodcastingEnabled ) {
					// Disable: clear category and save immediately to stop the feed.
					updateFields( { podcasting_category_id: '0' }, () => {
						submitForm();
					} );
				}
			}
		},
		[
			disabled,
			isPodcastingEnabled,
			fields.podcasting_title,
			settings?.blogname,
			updateFields,
			submitForm,
		]
	);

	const onCategorySelected = useCallback(
		( category ) => {
			updateFields( { podcasting_category_id: String( category.ID ) } );
			setIsEnabling( false );
		},
		[ updateFields ]
	);

	const onCoverImageRemoved = useCallback( () => {
		updateFields( {
			podcasting_image_id: '0',
			podcasting_image: '',
		} );
	}, [ updateFields ] );

	const onCoverImageSelected = useCallback(
		( coverId, coverUrl ) => {
			updateFields( {
				podcasting_image_id: String( coverId ),
				podcasting_image: coverUrl,
			} );
		},
		[ updateFields ]
	);

	if ( ! site || ! siteId ) {
		return null;
	}

	// Error states — render inside a Card so they sit within the page layout.
	if ( isPrivate ) {
		return (
			<Card className="site-settings__card">
				<PodcastingPrivateSiteMessage isComingSoon={ isComingSoon } />
			</Card>
		);
	}
	if ( ! userCanManagePodcasting ) {
		return (
			<Card className="site-settings__card">
				<PodcastingNoPermissionsMessage />
			</Card>
		);
	}
	if ( isUnsupportedSite ) {
		return (
			<Card className="site-settings__card">
				<PodcastingNotSupportedMessage />
			</Card>
		);
	}

	const renderTextField = ( { FormComponent = FormInput, key, label, explanation } ) => (
		<FormFieldset key={ key }>
			<FormLabel htmlFor={ key }>{ label }</FormLabel>
			{ explanation && <FormSettingExplanation>{ explanation }</FormSettingExplanation> }
			<FormComponent
				id={ key }
				name={ key }
				value={ decodeEntities( fields[ key ] ) || '' }
				onChange={ onChangeField( key ) }
				disabled={ disabled }
			/>
		</FormFieldset>
	);

	return (
		<form id="site-settings" onSubmit={ handleSubmitForm }>
			<QueryTerms siteId={ siteId } taxonomy="category" />

			{ /* Podcasting enable toggle */ }
			<Card className="site-settings__card">
				<ToggleControl
					checked={ isPodcastingEnabled || isEnabling }
					onChange={ onTogglePodcasting }
					disabled={ disabled }
					label={ translate( 'Enable podcasting on this site' ) }
				/>
				{ isPodcastingEnabled && (
					<FormSettingExplanation>
						{ translate(
							'Disable to stop publishing your podcast feed. You can always set it up again.'
						) }
					</FormSettingExplanation>
				) }
			</Card>

			{ /* Upsell nudge for audio upload */ }
			{ ( isPodcastingEnabled || isEnabling ) && plansDataLoaded && ! isAudioUploadEnabled && (
				<UpsellNudge
					plan={ PLAN_PERSONAL }
					title={ translate( 'Upload Audio with WordPress.com %(personalPlanName)s', {
						args: { personalPlanName: getPlan( PLAN_PERSONAL ).getTitle() },
					} ) }
					description={ translate( 'Embed podcast episodes directly from your media library.' ) }
					feature={ WPCOM_FEATURES_UPLOAD_AUDIO_FILES }
					event="podcasting_details_upload_audio"
					tracksImpressionName="calypso_upgrade_nudge_impression"
					tracksClickName="calypso_upgrade_nudge_cta_click"
					showIcon
				/>
			) }

			{ ( isPodcastingEnabled || isEnabling ) && (
				<>
					{ /* Podcast category */ }
					<SettingsSectionHeader
						disabled={ disabled || ! isPodcastingEnabled }
						id="podcast-category"
						isSaving={ isSavingSettings }
						onButtonClick={ handleSubmitForm }
						showButton
						title={ translate( 'Podcast category' ) }
					/>
					<Card className="site-settings__card">
						{ isEnabling && ! isPodcastingEnabled && (
							<Notice
								isCompact
								status="is-info"
								showDismiss={ false }
								text={ translate(
									'Select a category for your podcast feed, then save your settings.'
								) }
							/>
						) }
						{ isPodcastingEnabled && (
							<div className="podcasting-details__publish-wrapper">
								<PodcastingPublishNotice podcastingCategoryId={ podcastingCategoryId } />
							</div>
						) }
						<FormFieldset>
							<FormSettingExplanation>
								{ translate(
									'Posts published in this category will be included in your podcast feed.'
								) }
							</FormSettingExplanation>
							<TermTreeSelector
								taxonomy="category"
								selected={ podcastingCategoryId ? [ podcastingCategoryId ] : [] }
								podcastingCategoryId={ podcastingCategoryId }
								onChange={ onCategorySelected }
								addTerm
								onAddTermSuccess={ onCategorySelected }
								height={ 200 }
							/>
							{ isCategoryChanging && (
								<Notice
									isCompact
									status="is-info"
									text={ translate(
										'If you change categories, you will need to resubmit your feed to Apple Podcasts and any other podcasting services.'
									) }
								/>
							) }
						</FormFieldset>
						<PodcastFeedUrl categoryId={ podcastingCategoryId } />
						{ isPodcastingEnabled && (
							<Button className="podcasting-details__publish-button" href={ newPostUrl }>
								{ translate( 'Create Episode' ) }
							</Button>
						) }
					</Card>

					{ /* Podcast details */ }
					<SettingsSectionHeader
						disabled={ disabled || ! isPodcastingEnabled }
						id="podcast-details"
						isSaving={ isSavingSettings }
						onButtonClick={ handleSubmitForm }
						showButton
						title={ translate( 'Podcast details' ) }
					/>
					<Card className="site-settings__card">
						<FormSettingExplanation>
							{ translate(
								'This information appears in podcast apps like Apple Podcasts and Spotify.'
							) }
						</FormSettingExplanation>
						<div className="podcasting-details__cover-and-info">
							<PodcastCoverImageSetting
								coverImageId={ parseInt( fields.podcasting_image_id, 10 ) || 0 }
								coverImageUrl={ fields.podcasting_image }
								onRemove={ onCoverImageRemoved }
								onSelect={ onCoverImageSelected }
								onUploadStateChange={ setIsCoverImageUploading }
								isDisabled={ disabled }
							/>
							<div className="podcasting-details__title-subtitle-wrapper">
								{ renderTextField( {
									key: 'podcasting_title',
									label: translate( 'Title' ),
								} ) }
								{ renderTextField( {
									FormComponent: FormTextarea,
									key: 'podcasting_summary',
									label: translate( 'Summary/Description' ),
								} ) }
							</div>
						</div>
						{ renderTextField( {
							key: 'podcasting_talent_name',
							label: translate( 'Hosts/Artist/Producer' ),
						} ) }
						{ renderTextField( {
							key: 'podcasting_copyright',
							label: translate( 'Copyright' ),
						} ) }
					</Card>

					{ /* Feed settings */ }
					<SettingsSectionHeader
						disabled={ disabled || ! isPodcastingEnabled }
						id="feed-settings"
						isSaving={ isSavingSettings }
						onButtonClick={ handleSubmitForm }
						showButton
						title={ translate( 'Feed settings' ) }
					/>
					<Card className="site-settings__card">
						<FormSettingExplanation>
							{ translate( 'Configure how your podcast appears in directories and apps.' ) }
						</FormSettingExplanation>
						<FormFieldset>
							<FormLabel htmlFor="podcasting_category_1">
								{ translate( 'Podcast topics' ) }
							</FormLabel>
							<FormSettingExplanation>
								{ translate(
									'Choose how your podcast should be categorized within Apple Podcasts and other podcasting services.'
								) }
							</FormSettingExplanation>
							<TopicsSelector
								id="podcasting_category_1"
								name="podcasting_category_1"
								onChange={ handleSelect }
								value={ fields.podcasting_category_1 || 0 }
								disabled={ disabled }
							/>
							<TopicsSelector
								id="podcasting_category_2"
								name="podcasting_category_2"
								onChange={ handleSelect }
								value={ fields.podcasting_category_2 || 0 }
								disabled={ disabled }
							/>
							<TopicsSelector
								id="podcasting_category_3"
								name="podcasting_category_3"
								onChange={ handleSelect }
								value={ fields.podcasting_category_3 || 0 }
								disabled={ disabled }
							/>
						</FormFieldset>
						<FormFieldset>
							<FormLabel htmlFor="podcasting_explicit">
								{ translate( 'Explicit content' ) }
							</FormLabel>
							<FormSelect
								id="podcasting_explicit"
								name="podcasting_explicit"
								onChange={ handleSelect }
								value={ fields.podcasting_explicit || 'no' }
								disabled={ disabled }
							>
								<option value="no">{ translate( 'No' ) }</option>
								<option value="yes">{ translate( 'Yes' ) }</option>
								<option value="clean">{ translate( 'Clean' ) }</option>
							</FormSelect>
						</FormFieldset>
						{ renderTextField( {
							key: 'podcasting_email',
							label: translate( 'Email address' ),
							explanation: translate(
								'This email address will be displayed in the feed and is required for some services such as Google Play.'
							),
						} ) }
					</Card>
				</>
			) }
		</form>
	);
} );

const PodcastingDetails = () => {
	const translate = useTranslate();

	return (
		<Main wideLayout className="site-settings podcasting-details">
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
			<PodcastingSettingsForm />
		</Main>
	);
};

export default PodcastingDetails;
