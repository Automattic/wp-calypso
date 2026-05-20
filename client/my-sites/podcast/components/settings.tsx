import {
	BaseControl,
	Button,
	Card,
	CardBody,
	CardHeader,
	FormTokenField,
	Notice,
	SelectControl,
	TextControl,
	TextareaControl,
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import TermFormDialog from 'calypso/blocks/term-form-dialog';
import QueryMedia from 'calypso/components/data/query-media';
import { decodeEntities } from 'calypso/lib/formatting';
import PodcastCoverImageSetting from 'calypso/my-sites/site-settings/podcast-cover-image-setting';
import useTopics from 'calypso/my-sites/site-settings/podcasting-details/use-topics';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getMediaItem from 'calypso/state/selectors/get-media-item';
import { getTerms } from 'calypso/state/terms/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useHasPublishedEpisode } from '../hooks/use-has-published-episode';
import { computeSubmissionIssues } from '../hooks/use-submission-issues';
import ReadinessBanner from './readiness-banner';

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
	Object.fromEntries(
		TRACKED_FIELDS.filter( ( key ) => settings && key in settings ).map( ( key ) => [
			key,
			settings![ key ],
		] )
	) as PodcastingFields;

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
			const topicKey = topic.key.replaceAll( '&', '&amp;' );
			options.push( { value: topicKey, label: topic.label as string } );
			topic.subtopics.forEach( ( sub ) => {
				const subKey = topicKey + ',' + sub.key.replaceAll( '&', '&amp;' );
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
	const dispatch = useDispatch();

	const [ isCoverImageUploading, setIsCoverImageUploading ] = useState( false );
	const [ isAddCategoryOpen, setIsAddCategoryOpen ] = useState( false );
	const [ isConfirmingDisable, setIsConfirmingDisable ] = useState( false );

	const siteId = useSelector( getSelectedSiteId );
	const site = useSelector( getSelectedSite );
	const categories = useSelector(
		( state ) =>
			( getTerms( state, siteId ?? 0, 'category' ) as { ID: number; name?: string }[] | null ) ?? []
	);

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

	const disabled = isRequestingSettings || isSavingSettings || isCoverImageUploading;

	// Pre-fill the title from the site name on first arrival when the user
	// hasn't enabled podcasting yet. Mirrors the legacy toggle-on behavior so
	// users coming from Welcome's "Enable podcasting" CTA see a sensible default.
	useEffect( () => {
		if (
			! isRequestingSettings &&
			! isPodcastingEnabled &&
			! fields.podcasting_title &&
			! settings?.podcasting_title &&
			settings?.blogname
		) {
			updateFields( { podcasting_title: settings.blogname } );
		}
	}, [
		isRequestingSettings,
		isPodcastingEnabled,
		fields.podcasting_title,
		settings?.podcasting_title,
		settings?.blogname,
		updateFields,
	] );

	// Cover-image meta is needed to validate dimensions/format against
	// Apple Podcasts' cover-art requirements (square, 1400-3000 px, PNG/JPG).
	const coverImageId = Number( fields.podcasting_image_id ?? 0 ) || 0;
	const coverImage = useSelector( ( state ) =>
		coverImageId
			? ( getMediaItem( state, siteId ?? 0, coverImageId ) as {
					width?: number;
					height?: number;
					mime_type?: string;
			  } | null )
			: null
	);

	const hasPublishedEpisode = useHasPublishedEpisode( siteId, podcastingCategoryId );

	const submissionIssues = useMemo(
		() => computeSubmissionIssues( fields, coverImage, hasPublishedEpisode, translate ),
		[ fields, coverImage, hasPublishedEpisode, translate ]
	);

	const onDisablePodcasting = useCallback( () => {
		if ( disabled || ! isPodcastingEnabled ) {
			return;
		}
		dispatch(
			recordTracksEvent( 'calypso_podcast_disabled', { category_id: podcastingCategoryId } )
		);
		updateFields( { podcasting_category_id: '0' }, () => submitForm() );
	}, [ disabled, isPodcastingEnabled, podcastingCategoryId, dispatch, updateFields, submitForm ] );

	const onCategorySelected = useCallback(
		( category: { ID: number } ) => {
			if ( ! isPodcastingEnabled ) {
				dispatch( recordTracksEvent( 'calypso_podcast_enabled', { category_id: category.ID } ) );
			}
			updateFields( { podcasting_category_id: String( category.ID ) }, () => submitForm() );
		},
		[ isPodcastingEnabled, dispatch, updateFields, submitForm ]
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

	const topicLabelByValue = useMemo( () => {
		const map = new Map< string, string >();
		topicOptions.forEach( ( opt ) => {
			if ( opt.value && opt.value !== '0' ) {
				map.set( opt.value, opt.label );
			}
		} );
		return map;
	}, [ topicOptions ] );

	const topicValueByLabel = useMemo( () => {
		const map = new Map< string, string >();
		topicOptions.forEach( ( opt ) => {
			if ( opt.value && opt.value !== '0' ) {
				map.set( opt.label, opt.value );
			}
		} );
		return map;
	}, [ topicOptions ] );

	const selectedTopicLabels = useMemo( () => {
		return [
			fields.podcasting_category_1,
			fields.podcasting_category_2,
			fields.podcasting_category_3,
		]
			.map( ( v ) => {
				const value = String( v ?? '' );
				if ( ! value || value === '0' ) {
					return '';
				}
				return topicLabelByValue.get( value ) ?? '';
			} )
			.filter( Boolean );
	}, [
		fields.podcasting_category_1,
		fields.podcasting_category_2,
		fields.podcasting_category_3,
		topicLabelByValue,
	] );

	const topicSuggestions = useMemo(
		() => Array.from( topicLabelByValue.values() ),
		[ topicLabelByValue ]
	);

	const onTopicsChange = useCallback(
		( tokens: ( string | { value: string } )[] ) => {
			const labels = Array.from(
				new Set(
					tokens
						.map( ( t ) => ( typeof t === 'string' ? t : t.value ) )
						.filter( ( label ) => topicValueByLabel.has( label ) )
				)
			).slice( 0, 3 );
			const values = labels.map( ( label ) => topicValueByLabel.get( label ) ?? '0' );
			while ( values.length < 3 ) {
				values.push( '0' );
			}
			updateFields(
				{
					podcasting_category_1: values[ 0 ],
					podcasting_category_2: values[ 1 ],
					podcasting_category_3: values[ 2 ],
				},
				() => submitForm()
			);
		},
		[ topicValueByLabel, updateFields, submitForm ]
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
			<VStack spacing={ 4 } className="podcast__settings">
				{ siteId && coverImageId && <QueryMedia siteId={ siteId } mediaId={ coverImageId } /> }

				<ReadinessBanner issues={ submissionIssues } isPodcastingEnabled={ isPodcastingEnabled } />

				<Card className="site-settings__card podcast__card">
					<CardHeader>
						<VStack spacing={ 1 }>
							<Heading level={ 3 }>{ translate( 'Podcast category' ) }</Heading>
							<Text variant="muted">
								{ translate(
									'Posts in this category are treated as podcast episodes. Add an audio or video block to each one so listeners have something to play.'
								) }
							</Text>
						</VStack>
					</CardHeader>
					<CardBody>
						<VStack spacing={ 6 }>
							<VStack spacing={ 2 }>
								<SelectControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={ translate( 'Category' ) as string }
									hideLabelFromVision
									value={ podcastingCategoryId ? String( podcastingCategoryId ) : '' }
									options={ categoryOptions }
									onChange={ onCategoryDropdownChange }
									disabled={ disabled }
								/>
								<Button
									variant="link"
									className="podcast__settings-category-add"
									onClick={ () => setIsAddCategoryOpen( true ) }
									disabled={ disabled }
								>
									{ translate( 'Create a new category' ) }
								</Button>
							</VStack>

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

				<Card className="site-settings__card podcast__card">
					<CardHeader>
						<VStack spacing={ 1 }>
							<Heading level={ 3 }>{ translate( 'Show details' ) }</Heading>
							<Text variant="muted">
								{ translate(
									'This information appears in podcast apps like Apple Podcasts and Spotify.'
								) }
							</Text>
						</VStack>
					</CardHeader>
					<CardBody>
						<VStack spacing={ 6 }>
							<div className="podcast__settings-cover">
								<PodcastCoverImageSetting
									coverImageId={ Number( fields.podcasting_image_id ?? 0 ) || 0 }
									coverImageUrl={ fields.podcasting_image ?? '' }
									onRemove={ onCoverImageRemoved }
									onSelect={ onCoverImageSelected }
									onUploadStateChange={ setIsCoverImageUploading }
									isDisabled={ disabled }
									previewSize={ 256 }
								/>
							</div>

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

				<Card className="site-settings__card podcast__card">
					<CardHeader>
						<VStack spacing={ 1 }>
							<Heading level={ 3 }>{ translate( 'Feed settings' ) }</Heading>
							<Text variant="muted">
								{ translate( 'Configure how your podcast appears in directories and apps.' ) }
							</Text>
						</VStack>
					</CardHeader>
					<CardBody>
						<VStack spacing={ 6 }>
							<BaseControl
								__nextHasNoMarginBottom
								help={
									translate(
										'Choose how your podcast should be categorized within Apple Podcasts and other podcasting services. Pick up to three.'
									) as string
								}
							>
								<FormTokenField
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									__experimentalExpandOnFocus
									__experimentalShowHowTo={ false }
									label={ translate( 'Podcast topics' ) as string }
									value={ selectedTopicLabels }
									suggestions={ topicSuggestions }
									maxLength={ 3 }
									onChange={ onTopicsChange }
									disabled={ disabled }
								/>
							</BaseControl>

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
									] as { value: string; label: string }[]
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
										'Included in your feed so podcast directories can verify ownership. Most require it for submission.'
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

				{ isPodcastingEnabled && (
					<Card className="site-settings__card podcast__card">
						<CardHeader>
							<VStack spacing={ 1 }>
								<Heading level={ 3 }>{ translate( 'Disable podcasting' ) }</Heading>
								<Text variant="muted">
									{ translate(
										'Stops publishing your podcast feed. Your show details stay saved, so you can set it up again later.'
									) }
								</Text>
							</VStack>
						</CardHeader>
						<CardBody>
							<Button
								variant="secondary"
								isDestructive
								onClick={ () => setIsConfirmingDisable( true ) }
								disabled={ disabled }
							>
								{ translate( 'Disable' ) }
							</Button>
						</CardBody>
					</Card>
				) }

				<ConfirmDialog
					isOpen={ isConfirmingDisable }
					onConfirm={ () => {
						setIsConfirmingDisable( false );
						onDisablePodcasting();
					} }
					onCancel={ () => setIsConfirmingDisable( false ) }
					confirmButtonText={ translate( 'Disable' ) as string }
				>
					{ translate(
						'Disable podcasting? Your feed will stop publishing. Your show details stay saved.'
					) }
				</ConfirmDialog>
			</VStack>
		</form>
	);
};

export default wrapSettingsForm( getFormSettings )( PodcastingSettingsForm );
