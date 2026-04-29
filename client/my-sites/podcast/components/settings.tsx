import {
	PLAN_PERSONAL,
	WPCOM_FEATURES_UPLOAD_AUDIO_FILES,
	getPlan,
} from '@automattic/calypso-products';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Notice,
	SelectControl,
	TextControl,
	TextareaControl,
	ToggleControl,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { pick } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import TermTreeSelector from 'calypso/blocks/term-tree-selector';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import { decodeEntities } from 'calypso/lib/formatting';
import PodcastCoverImageSetting from 'calypso/my-sites/site-settings/podcast-cover-image-setting';
import useTopics from 'calypso/my-sites/site-settings/podcasting-details/use-topics';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import { useSelector } from 'calypso/state';
import { hasLoadedSitePlansFromServer } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getTerm } from 'calypso/state/terms/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

const TRACKED_FIELDS = [
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
] as const;

type PodcastingFieldKey = ( typeof TRACKED_FIELDS )[ number ];

type PodcastingFields = Partial< Record< PodcastingFieldKey, string > >;

type SiteSettingsShape = {
	podcasting_category_id?: string | number;
	blogname?: string;
	[ key: string ]: unknown;
};

const getFormSettings = ( settings: SiteSettingsShape | undefined ): PodcastingFields =>
	pick( settings ?? {}, TRACKED_FIELDS ) as PodcastingFields;

interface PodcastingFormProps {
	fields: PodcastingFields;
	settings?: SiteSettingsShape;
	dirtyFields: string[];
	handleSubmitForm: ( event?: React.FormEvent< HTMLFormElement > ) => void;
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
	updateFields: ( fields: Record< string, string >, callback?: () => void ) => void;
	submitForm: () => void;
}

interface PodcastTopicOption {
	value: string;
	label: string;
}

const useTopicOptions = (): PodcastTopicOption[] => {
	const translate = useTranslate();
	const topics = useTopics();

	return useMemo( () => {
		const options: PodcastTopicOption[] = [
			{
				value: '0',
				label: translate( 'None', { context: 'podcast topic selector' } ) as string,
			},
		];

		topics.forEach( ( topic ) => {
			// Apple Podcasts topic keys use HTML entities for ampersands.
			const topicKey = topic.key.replace( '&', '&amp;' );
			options.push( { value: topicKey, label: topic.label as string } );
			topic.subtopics.forEach( ( sub ) => {
				const subKey = topicKey + ',' + sub.key.replace( '&', '&amp;' );
				options.push( {
					value: subKey,
					label: `${ topic.label } » ${ sub.label }`,
				} );
			} );
		} );

		return options;
	}, [ topics, translate ] );
};

const PodcastingSettingsForm = ( {
	fields,
	settings,
	dirtyFields,
	handleSubmitForm,
	isRequestingSettings,
	isSavingSettings,
	updateFields,
	submitForm,
}: PodcastingFormProps ) => {
	const translate = useTranslate();
	const topicOptions = useTopicOptions();

	const [ isCoverImageUploading, setIsCoverImageUploading ] = useState( false );
	const [ isEnabling, setIsEnabling ] = useState( false );

	const siteId = useSelector( getSelectedSiteId );
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const plansDataLoaded = useSelector( ( state ) => hasLoadedSitePlansFromServer( state, siteId ) );

	const podcastingCategoryId = fields.podcasting_category_id
		? Number( fields.podcasting_category_id )
		: 0;
	const isPodcastingEnabled = podcastingCategoryId > 0;
	const showSettings = isPodcastingEnabled || isEnabling;

	const podcastingCategory = useSelector( ( state ) =>
		podcastingCategoryId
			? ( getTerm( state, siteId ?? 0, 'category', podcastingCategoryId ) as {
					name?: string;
					feed_url?: string;
			  } | null )
			: null
	);
	// WP.com Simple sites can return http:; prefer https for display.
	const feedUrl = useMemo( () => {
		const raw = podcastingCategory?.feed_url;
		if ( ! raw ) {
			return '';
		}
		return isJetpack ? raw : raw.replace( /^http:/, 'https:' );
	}, [ podcastingCategory, isJetpack ] );

	const isCategoryChanging =
		! isSavingSettings &&
		! isRequestingSettings &&
		settings &&
		Number( settings.podcasting_category_id ) > 0 &&
		podcastingCategoryId !== Number( settings.podcasting_category_id );

	const isAudioUploadEnabled =
		plansDataLoaded && ( site?.options?.upgraded_filetypes_enabled || isJetpack );

	const disabled = isRequestingSettings || isSavingSettings || isCoverImageUploading;

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
				return;
			}

			setIsEnabling( false );
			if ( isPodcastingEnabled ) {
				updateFields( { podcasting_category_id: '0' }, () => submitForm() );
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
			updateFields( { podcasting_category_id: String( category.ID ) }, () => submitForm() );
			setIsEnabling( false );
		},
		[ updateFields, submitForm ]
	);

	const onCoverImageRemoved = useCallback( () => {
		updateFields( { podcasting_image_id: '0', podcasting_image: '' }, () => submitForm() );
	}, [ updateFields, submitForm ] );

	const onCoverImageSelected = useCallback(
		( coverId: number, coverUrl: string ) => {
			updateFields(
				{
					podcasting_image_id: String( coverId ),
					podcasting_image: coverUrl,
				},
				() => submitForm()
			);
		},
		[ updateFields, submitForm ]
	);

	const onTextChange = useCallback(
		( key: PodcastingFieldKey ) => ( value: string | undefined ) => {
			updateFields( { [ key ]: value ?? '' } );
		},
		[ updateFields ]
	);

	const onTextBlur = useCallback( () => {
		if ( dirtyFields.length > 0 ) {
			submitForm();
		}
	}, [ dirtyFields, submitForm ] );

	const onTopicChange = useCallback(
		( key: 'podcasting_category_1' | 'podcasting_category_2' | 'podcasting_category_3' ) =>
			( value: string ) => {
				updateFields( { [ key ]: value }, () => submitForm() );
			},
		[ updateFields, submitForm ]
	);

	const onExplicitChange = useCallback(
		( value: string ) => {
			updateFields( { podcasting_explicit: value }, () => submitForm() );
		},
		[ updateFields, submitForm ]
	);

	const podcastingCategoryName = podcastingCategory?.name;
	const newPostUrl = siteSlug ? `/post/${ siteSlug }` : '';

	if ( ! site || ! siteId ) {
		return null;
	}

	return (
		<form id="site-settings" onSubmit={ handleSubmitForm }>
			<header className="podcast__section-header">
				<h2 className="podcast__section-heading">{ translate( 'Settings' ) }</h2>
				<p className="podcast__section-description">
					{ translate(
						'Configure your podcast feed details. These show up in Apple Podcasts, Spotify, and other directories.'
					) }
				</p>
			</header>

			<VStack spacing={ 4 } className="podcast__settings">
				{ /* Enable / disable */ }
				<Card className="site-settings__card podcast__card">
					<CardBody>
						<ToggleControl
							__nextHasNoMarginBottom
							checked={ isPodcastingEnabled || isEnabling }
							onChange={ onTogglePodcasting }
							disabled={ disabled }
							label={ translate( 'Enable podcasting on this site' ) as string }
							help={
								isPodcastingEnabled
									? ( translate(
											'Disable to stop publishing your podcast feed. You can always set it up again.'
									  ) as string )
									: undefined
							}
						/>
					</CardBody>
				</Card>

				{ /* Audio upload upsell */ }
				{ showSettings && plansDataLoaded && ! isAudioUploadEnabled && (
					<UpsellNudge
						plan={ PLAN_PERSONAL }
						title={ translate( 'Upload Audio with WordPress.com %(personalPlanName)s', {
							args: { personalPlanName: getPlan( PLAN_PERSONAL )?.getTitle() ?? '' },
						} ) }
						description={ translate( 'Embed podcast episodes directly from your media library.' ) }
						feature={ WPCOM_FEATURES_UPLOAD_AUDIO_FILES }
						event="podcasting_details_upload_audio"
						tracksImpressionName="calypso_upgrade_nudge_impression"
						tracksClickName="calypso_upgrade_nudge_cta_click"
						showIcon
					/>
				) }

				{ showSettings && (
					<>
						{ /* Category + RSS feed */ }
						<Card className="site-settings__card podcast__card">
							<CardHeader>
								<VStack spacing={ 1 }>
									<Heading level={ 4 }>{ translate( 'Podcast category' ) }</Heading>
									<Text variant="muted">
										{ translate(
											'Posts published in this category will be included in your podcast feed.'
										) }
									</Text>
								</VStack>
							</CardHeader>
							<CardBody>
								<VStack spacing={ 6 }>
									{ isEnabling && ! isPodcastingEnabled && (
										<Notice status="info" isDismissible={ false }>
											{ translate(
												'Select a category for your podcast feed, then save your settings.'
											) }
										</Notice>
									) }

									{ isPodcastingEnabled && podcastingCategoryName && (
										<Notice status="success" isDismissible={ false }>
											{ translate(
												'Publish blog posts in the {{strong}}%s{{/strong}} category to add new episodes.',
												{
													args: podcastingCategoryName,
													components: { strong: <strong /> },
												}
											) }
										</Notice>
									) }

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
										<Notice status="warning" isDismissible={ false }>
											{ translate(
												'If you change categories, you will need to resubmit your feed to Apple Podcasts and any other podcasting services.'
											) }
										</Notice>
									) }

									{ feedUrl && (
										<VStack spacing={ 2 }>
											<Text weight={ 500 }>{ translate( 'RSS feed' ) }</Text>
											<ClipboardButtonInput value={ feedUrl } />
											<Text variant="muted" size="12">
												{ translate(
													'Copy your feed URL and submit it to Apple Podcasts and other podcasting services.'
												) }
											</Text>
										</VStack>
									) }

									{ isPodcastingEnabled && newPostUrl && (
										<HStack justify="flex-start">
											<Button variant="secondary" href={ newPostUrl }>
												{ translate( 'Create episode' ) }
											</Button>
										</HStack>
									) }
								</VStack>
							</CardBody>
						</Card>

						{ /* Show details */ }
						<Card className="site-settings__card podcast__card">
							<CardHeader>
								<VStack spacing={ 1 }>
									<Heading level={ 4 }>{ translate( 'Show details' ) }</Heading>
									<Text variant="muted">
										{ translate(
											'This information appears in podcast apps like Apple Podcasts and Spotify.'
										) }
									</Text>
								</VStack>
							</CardHeader>
							<CardBody>
								<VStack spacing={ 6 }>
									<HStack
										alignment="flex-start"
										spacing={ 6 }
										justify="flex-start"
										className="podcast__settings-cover-row"
									>
										<PodcastCoverImageSetting
											coverImageId={ Number( fields.podcasting_image_id ?? 0 ) || 0 }
											coverImageUrl={ fields.podcasting_image ?? '' }
											onRemove={ onCoverImageRemoved }
											onSelect={ onCoverImageSelected }
											onUploadStateChange={ setIsCoverImageUploading }
											isDisabled={ disabled }
										/>

										<VStack spacing={ 4 } className="podcast__settings-cover-fields">
											<TextControl
												__nextHasNoMarginBottom
												__next40pxDefaultSize
												label={ translate( 'Title' ) as string }
												value={ decodeEntities( fields.podcasting_title ?? '' ) }
												onChange={ onTextChange( 'podcasting_title' ) }
												onBlur={ onTextBlur }
												disabled={ disabled }
											/>
											<TextareaControl
												__nextHasNoMarginBottom
												label={ translate( 'Summary / Description' ) as string }
												value={ decodeEntities( fields.podcasting_summary ?? '' ) }
												onChange={ onTextChange( 'podcasting_summary' ) }
												onBlur={ onTextBlur }
												disabled={ disabled }
												rows={ 4 }
											/>
										</VStack>
									</HStack>

									<TextControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										label={ translate( 'Hosts / Artist / Producer' ) as string }
										value={ decodeEntities( fields.podcasting_talent_name ?? '' ) }
										onChange={ onTextChange( 'podcasting_talent_name' ) }
										onBlur={ onTextBlur }
										disabled={ disabled }
									/>

									<TextControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										label={ translate( 'Copyright' ) as string }
										value={ decodeEntities( fields.podcasting_copyright ?? '' ) }
										onChange={ onTextChange( 'podcasting_copyright' ) }
										onBlur={ onTextBlur }
										disabled={ disabled }
									/>
								</VStack>
							</CardBody>
						</Card>

						{ /* Feed metadata */ }
						<Card className="site-settings__card podcast__card">
							<CardHeader>
								<VStack spacing={ 1 }>
									<Heading level={ 4 }>{ translate( 'Feed settings' ) }</Heading>
									<Text variant="muted">
										{ translate( 'Configure how your podcast appears in directories and apps.' ) }
									</Text>
								</VStack>
							</CardHeader>
							<CardBody>
								<VStack spacing={ 6 }>
									<fieldset className="podcast__settings-topics">
										<legend className="podcast__settings-topics-legend">
											{ translate( 'Podcast topics' ) }
										</legend>
										<Text variant="muted" size="12">
											{ translate(
												'Choose how your podcast should be categorized within Apple Podcasts and other podcasting services.'
											) }
										</Text>
										<VStack spacing={ 3 }>
											<SelectControl
												__nextHasNoMarginBottom
												__next40pxDefaultSize
												label={ translate( 'Primary topic' ) as string }
												hideLabelFromVision
												value={ String( fields.podcasting_category_1 ?? '0' ) }
												options={ topicOptions }
												onChange={ onTopicChange( 'podcasting_category_1' ) }
												disabled={ disabled }
											/>
											<SelectControl
												__nextHasNoMarginBottom
												__next40pxDefaultSize
												label={ translate( 'Secondary topic' ) as string }
												hideLabelFromVision
												value={ String( fields.podcasting_category_2 ?? '0' ) }
												options={ topicOptions }
												onChange={ onTopicChange( 'podcasting_category_2' ) }
												disabled={ disabled }
											/>
											<SelectControl
												__nextHasNoMarginBottom
												__next40pxDefaultSize
												label={ translate( 'Tertiary topic' ) as string }
												hideLabelFromVision
												value={ String( fields.podcasting_category_3 ?? '0' ) }
												options={ topicOptions }
												onChange={ onTopicChange( 'podcasting_category_3' ) }
												disabled={ disabled }
											/>
										</VStack>
									</fieldset>

									<SelectControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										label={ translate( 'Explicit content' ) as string }
										value={ String( fields.podcasting_explicit ?? 'no' ) }
										options={
											[
												{ value: 'no', label: translate( 'No' ) as string },
												{ value: 'yes', label: translate( 'Yes' ) as string },
												{ value: 'clean', label: translate( 'Clean' ) as string },
											] as PodcastTopicOption[]
										}
										onChange={ onExplicitChange }
										disabled={ disabled }
									/>

									<TextControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										type="email"
										label={ translate( 'Email address' ) as string }
										help={
											translate(
												'This email address will be displayed in the feed and is required for some services such as Google Play.'
											) as string
										}
										value={ decodeEntities( fields.podcasting_email ?? '' ) }
										onChange={ onTextChange( 'podcasting_email' ) }
										onBlur={ onTextBlur }
										disabled={ disabled }
									/>
								</VStack>
							</CardBody>
						</Card>
					</>
				) }
			</VStack>
		</form>
	);
};

// `wrapSettingsForm` is a JS HOC; type its output loosely and cast its inputs.
const Settings = wrapSettingsForm( getFormSettings )(
	PodcastingSettingsForm as unknown as React.ComponentType
) as unknown as React.ComponentType;

export default Settings;
