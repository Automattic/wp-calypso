import {
	PLAN_PERSONAL,
	WPCOM_FEATURES_UPLOAD_AUDIO_FILES,
	getPlan,
} from '@automattic/calypso-products';
import { Button, Card, FormLabel } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { pick } from 'lodash';
import { useState, useCallback, type ComponentType, type FormEvent } from 'react';
import TermTreeSelector from 'calypso/blocks/term-tree-selector';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QueryTerms from 'calypso/components/data/query-terms';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import Notice from 'calypso/components/notice';
import { decodeEntities } from 'calypso/lib/formatting';
import PodcastCoverImageSetting from 'calypso/my-sites/site-settings/podcast-cover-image-setting';
import PodcastFeedUrlRaw from 'calypso/my-sites/site-settings/podcasting-details/feed-url';
import PodcastingNoPermissionsMessage from 'calypso/my-sites/site-settings/podcasting-details/no-permissions';
import PodcastingNotSupportedMessage from 'calypso/my-sites/site-settings/podcasting-details/not-supported';
import PodcastingPrivateSiteMessage from 'calypso/my-sites/site-settings/podcasting-details/private-site';
import PodcastingPublishNoticeRaw from 'calypso/my-sites/site-settings/podcasting-details/publish-notice';
import TopicsSelectorRaw from 'calypso/my-sites/site-settings/podcasting-details/topics-selector';
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

const PodcastingPublishNotice = PodcastingPublishNoticeRaw as ComponentType< {
	podcastingCategoryId: number;
} >;
const PodcastFeedUrl = PodcastFeedUrlRaw as ComponentType< { categoryId: number } >;
const TopicsSelector = TopicsSelectorRaw as ComponentType< {
	id: string;
	name: string;
	onChange: ( event: React.ChangeEvent< HTMLSelectElement > ) => void;
	value: string | number;
	disabled: boolean;
} >;

type PodcastingFields = {
	podcasting_category_id?: string;
	podcasting_title?: string;
	podcasting_talent_name?: string;
	podcasting_summary?: string;
	podcasting_copyright?: string;
	podcasting_explicit?: string;
	podcasting_image?: string;
	podcasting_category_1?: string | number;
	podcasting_category_2?: string | number;
	podcasting_category_3?: string | number;
	podcasting_email?: string;
	podcasting_image_id?: string;
};

type PodcastingSettings = PodcastingFields & {
	blogname?: string;
};

type PodcastingSettingsFormProps = {
	fields: PodcastingFields;
	handleSubmitForm: ( event?: FormEvent< HTMLFormElement > ) => void;
	handleSelect: ( event: React.ChangeEvent< HTMLSelectElement > ) => void;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	onChangeField: ( field: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	settings?: PodcastingSettings;
	updateFields: ( fields: Partial< PodcastingFields >, callback?: () => void ) => void;
	submitForm: () => void;
};

type TextFieldArgs = {
	FormComponent?: ComponentType< Record< string, unknown > >;
	key: keyof PodcastingFields;
	label: string;
	explanation?: string;
};

const getFormSettings = ( settings?: PodcastingSettings ): PodcastingFields => {
	return pick( settings ?? {}, [
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

const PodcastingSettings = wrapSettingsForm( getFormSettings )( ( {
	fields,
	handleSubmitForm,
	handleSelect,
	isRequestingSettings,
	isSavingSettings,
	onChangeField,
	settings,
	updateFields,
	submitForm,
}: PodcastingSettingsFormProps ) => {
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
		( isEnabled: boolean ) => {
			if ( disabled ) {
				return;
			}

			if ( isEnabled ) {
				setIsEnabling( true );
				if ( ! fields.podcasting_title ) {
					updateFields( { podcasting_title: settings?.blogname || '' } );
				}
			} else {
				setIsEnabling( false );
				if ( isPodcastingEnabled ) {
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
		( category: { ID: number } ) => {
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
		( coverId: number, coverUrl: string ) => {
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

	const renderTextField = ( {
		FormComponent = FormInput,
		key,
		label,
		explanation,
	}: TextFieldArgs ) => (
		<FormFieldset key={ key }>
			<FormLabel htmlFor={ key }>{ label }</FormLabel>
			{ explanation && <FormSettingExplanation>{ explanation }</FormSettingExplanation> }
			<FormComponent
				id={ key }
				name={ key }
				value={ decodeEntities( String( fields[ key ] ?? '' ) ) || '' }
				onChange={ onChangeField( key ) }
				disabled={ disabled }
			/>
		</FormFieldset>
	);

	return (
		<form id="site-settings" onSubmit={ handleSubmitForm }>
			<header className="podcasting__section-header">
				<h2 className="podcasting__section-heading">{ translate( 'Settings' ) }</h2>
				<p className="podcasting__section-description">
					{ translate( 'Configure your podcast feed and directory listing.' ) }
				</p>
			</header>
			<QueryTerms siteId={ siteId } taxonomy="category" />

			<Card className="site-settings__card">
				<ToggleControl
					checked={ isPodcastingEnabled || isEnabling }
					onChange={ onTogglePodcasting }
					disabled={ disabled }
					label={ translate( 'Enable podcasting on this site' ) as string }
				/>
				{ isPodcastingEnabled && (
					<FormSettingExplanation>
						{ translate(
							'Disable to stop publishing your podcast feed. You can always set it up again.'
						) }
					</FormSettingExplanation>
				) }
			</Card>

			{ ( isPodcastingEnabled || isEnabling ) && plansDataLoaded && ! isAudioUploadEnabled && (
				<UpsellNudge
					plan={ PLAN_PERSONAL }
					title={ translate( 'Upload Audio with WordPress.com %(personalPlanName)s', {
						args: { personalPlanName: getPlan( PLAN_PERSONAL )?.getTitle() ?? '' },
					} ) }
					description={ translate( 'Embed podcast episodes directly from your media library.' ) }
					feature={ WPCOM_FEATURES_UPLOAD_AUDIO_FILES }
					event="podcasting_upload_audio"
					tracksImpressionName="calypso_upgrade_nudge_impression"
					tracksClickName="calypso_upgrade_nudge_cta_click"
					showIcon
				/>
			) }

			{ ( isPodcastingEnabled || isEnabling ) && (
				<>
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
							<div className="podcasting__publish-wrapper">
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
							<Button className="podcasting__publish-button" href={ newPostUrl }>
								{ translate( 'Create Episode' ) }
							</Button>
						) }
					</Card>

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
						<div className="podcasting__cover-and-info">
							<PodcastCoverImageSetting
								coverImageId={ parseInt( String( fields.podcasting_image_id ?? '0' ), 10 ) || 0 }
								coverImageUrl={ fields.podcasting_image }
								onRemove={ onCoverImageRemoved }
								onSelect={ onCoverImageSelected }
								onUploadStateChange={ setIsCoverImageUploading }
								isDisabled={ disabled }
							/>
							<div className="podcasting__title-subtitle-wrapper">
								{ renderTextField( {
									key: 'podcasting_title',
									label: translate( 'Title' ) as string,
								} ) }
								{ renderTextField( {
									FormComponent: FormTextarea,
									key: 'podcasting_summary',
									label: translate( 'Summary/Description' ) as string,
								} ) }
							</div>
						</div>
						{ renderTextField( {
							key: 'podcasting_talent_name',
							label: translate( 'Hosts/Artist/Producer' ) as string,
						} ) }
						{ renderTextField( {
							key: 'podcasting_copyright',
							label: translate( 'Copyright' ) as string,
						} ) }
					</Card>

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
							label: translate( 'Email address' ) as string,
							explanation: translate(
								'This email address will be displayed in the feed and is required for some services such as Google Play.'
							) as string,
						} ) }
					</Card>
				</>
			) }
		</form>
	);
} );

export default PodcastingSettings;
