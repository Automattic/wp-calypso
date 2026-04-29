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
import TermFormDialog from 'calypso/blocks/term-form-dialog';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { decodeEntities } from 'calypso/lib/formatting';
import PodcastCoverImageSetting from 'calypso/my-sites/site-settings/podcast-cover-image-setting';
import useTopics from 'calypso/my-sites/site-settings/podcasting-details/use-topics';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import { useSelector } from 'calypso/state';
import { hasLoadedSitePlansFromServer } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getTerms } from 'calypso/state/terms/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

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
	const [ isAddCategoryOpen, setIsAddCategoryOpen ] = useState( false );

	const siteId = useSelector( getSelectedSiteId );
	const site = useSelector( getSelectedSite );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const categories = useSelector(
		( state ) =>
			( getTerms( state, siteId ?? 0, 'category' ) as { ID: number; name?: string }[] | null ) ?? []
	);
	const plansDataLoaded = useSelector( ( state ) => hasLoadedSitePlansFromServer( state, siteId ) );

	const podcastingCategoryId = fields.podcasting_category_id
		? Number( fields.podcasting_category_id )
		: 0;
	const isPodcastingEnabled = podcastingCategoryId > 0;
	// Reveal the form for first-time setup (e.g. arriving from Welcome's
	// "Enable podcasting" CTA) so users can pick a category right away.
	const [ isEnabling, setIsEnabling ] = useState( ! isPodcastingEnabled );
	const showSettings = isPodcastingEnabled || isEnabling;

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

	const onCategoryDropdownChange = useCallback(
		( value: string ) => {
			const id = Number( value );
			if ( ! Number.isFinite( id ) || id <= 0 ) {
				return;
			}
			onCategorySelected( { ID: id } );
		},
		[ onCategorySelected ]
	);

	const categoryOptions = useMemo( () => {
		const options = categories.map( ( cat ) => ( {
			value: String( cat.ID ),
			label: decodeEntities( cat.name ?? '' ),
		} ) );
		options.sort( ( a, b ) => a.label.localeCompare( b.label ) );
		if ( ! podcastingCategoryId ) {
			options.unshift( {
				value: '',
				label: translate( 'Select a category' ) as string,
			} );
		}
		return options;
	}, [ categories, podcastingCategoryId, translate ] );

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
											'Posts in this category are treated as podcast episodes. Add an audio or video block to each one so listeners have something to play.'
										) }
									</Text>
								</VStack>
							</CardHeader>
							<CardBody>
								<VStack spacing={ 6 }>
									{ isEnabling && ! isPodcastingEnabled && (
										<Notice status="info" isDismissible={ false }>
											{ translate( 'Select a category to start your podcast feed.' ) }
										</Notice>
									) }

									<HStack alignment="flex-end" spacing={ 3 } justify="flex-start">
										<SelectControl
											__nextHasNoMarginBottom
											__next40pxDefaultSize
											className="podcast__settings-category-select"
											label={ translate( 'Category' ) as string }
											hideLabelFromVision
											value={ podcastingCategoryId ? String( podcastingCategoryId ) : '' }
											options={ categoryOptions }
											onChange={ onCategoryDropdownChange }
											disabled={ disabled }
										/>
										<Button
											variant="secondary"
											onClick={ () => setIsAddCategoryOpen( true ) }
											disabled={ disabled }
										>
											{ translate( 'Add category' ) }
										</Button>
									</HStack>

									<TermFormDialog
										showDialog={ isAddCategoryOpen }
										onClose={ () => setIsAddCategoryOpen( false ) }
										postType="post"
										taxonomy="category"
										onSuccess={ onCategorySelected }
									/>

									{ isCategoryChanging && (
										<Notice status="warning" isDismissible={ false }>
											{ translate(
												'If you change categories, you will need to resubmit your feed to Apple Podcasts and any other podcasting services.'
											) }
										</Notice>
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
