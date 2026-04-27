import {
	Button,
	Card,
	CardBody,
	Notice,
	RadioControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Field } from '@wordpress/dataviews';

type Status = 'idle' | 'saving' | 'saved';

type PodcastFormData = {
	title: string;
	summary: string;
	host: string;
	copyright: string;
	language: string;
	topic1: string;
	topic2: string;
	topic3: string;
	explicit: string;
	email: string;
	showType: string;
};

const INITIAL_FORM_DATA: PodcastFormData = {
	title: "Look Ma, It's a Podcast",
	summary: 'A weekly show about shipping fast at WordPress.com during Radical Speed Month.',
	host: 'Rob Pugh & Tony Arcangelini',
	copyright: '© 2026 Automattic',
	language: 'en-us',
	topic1: 'Technology',
	topic2: 'Business » Entrepreneurship',
	topic3: 'None',
	explicit: 'no',
	email: 'rob.pugh@automattic.com',
	showType: 'episodic',
};

const SITE_CATEGORIES = [
	'Alpacas',
	'Cerros',
	'Llamas',
	'Podcast',
	'Sipo',
	'Travel',
	'Uncategorized',
] as const;

function Settings() {
	const translate = useTranslate();
	const [ formData, setFormData ] = useState< PodcastFormData >( INITIAL_FORM_DATA );
	const [ hasCover, setHasCover ] = useState( false );
	const [ category, setCategory ] = useState( 'Podcast' );
	const [ hasPickedCategory, setHasPickedCategory ] = useState( true );
	const [ categoryPickerOpen, setCategoryPickerOpen ] = useState( false );
	const [ , setStatus ] = useState< Status >( 'saved' );
	const [ , setLastSavedAt ] = useState( () => new Date() );

	const saveTimer = useRef< ReturnType< typeof setTimeout > | null >( null );
	const firstRender = useRef( true );

	useEffect( () => {
		if ( firstRender.current ) {
			firstRender.current = false;
			return;
		}
		setStatus( 'saving' );
		if ( saveTimer.current ) {
			clearTimeout( saveTimer.current );
		}
		saveTimer.current = setTimeout( () => {
			setStatus( 'saved' );
			setLastSavedAt( new Date() );
		}, 600 );
		return () => {
			if ( saveTimer.current ) {
				clearTimeout( saveTimer.current );
			}
		};
	}, [ formData, hasCover, category ] );

	const fields = useMemo< Field< PodcastFormData >[] >(
		() => [
			{
				id: 'title',
				label: translate( 'Title' ) as string,
				type: 'text' as const,
			},
			{
				id: 'summary',
				label: translate( 'Summary/Description' ) as string,
				type: 'text' as const,
				Edit: 'textarea',
			},
			{
				id: 'host',
				label: translate( 'Hosts/Artist/Producer' ) as string,
				type: 'text' as const,
			},
			{
				id: 'copyright',
				label: translate( 'Copyright' ) as string,
				type: 'text' as const,
			},
			{
				id: 'language',
				label: translate( 'Language' ) as string,
				Edit: 'select',
				elements: [
					{ label: 'English (US)', value: 'en-us' },
					{ label: 'English (UK)', value: 'en-gb' },
					{ label: 'Spanish', value: 'es' },
					{ label: 'Portuguese (BR)', value: 'pt-br' },
				],
			},
			{
				id: 'topic1',
				label: translate( 'Podcast topics' ) as string,
				description: translate(
					'Choose how your podcast should be categorized within Apple Podcasts and other podcasting services.'
				) as string,
				Edit: 'select',
				elements: [
					{ label: 'Technology', value: 'Technology' },
					{ label: 'Business', value: 'Business' },
					{ label: 'Arts', value: 'Arts' },
					{ label: 'News', value: 'News' },
				],
			},
			{
				id: 'topic2',
				label: translate( 'Subtopic 1' ) as string,
				Edit: 'select',
				elements: [
					{ label: 'None', value: 'None' },
					{ label: 'Business » Entrepreneurship', value: 'Business » Entrepreneurship' },
					{ label: 'Technology » Software How-To', value: 'Technology » Software How-To' },
				],
			},
			{
				id: 'topic3',
				label: translate( 'Subtopic 2' ) as string,
				Edit: 'select',
				elements: [
					{ label: 'None', value: 'None' },
					{ label: 'News » Tech News', value: 'News » Tech News' },
					{ label: 'Business » Management', value: 'Business » Management' },
				],
			},
			{
				id: 'explicit',
				label: translate( 'Explicit content' ) as string,
				Edit: 'select',
				elements: [
					{ label: translate( 'No' ) as string, value: 'no' },
					{ label: translate( 'Yes' ) as string, value: 'yes' },
					{ label: translate( 'Clean' ) as string, value: 'clean' },
				],
			},
			{
				id: 'email',
				label: translate( 'Email address' ) as string,
				description: translate(
					'This email address will be displayed in the feed and is required for some services such as Google Play.'
				) as string,
				type: 'email' as const,
			},
			{
				id: 'showType',
				label: translate( 'Show type' ) as string,
				description: translate(
					'Episodic is right for most shows. Pick Serial if episodes should be heard in order.'
				) as string,
				Edit: 'select',
				elements: [
					{
						label: translate( 'Episodic (newest episode first)' ) as string,
						value: 'episodic',
					},
					{
						label: translate( 'Serial (meant to be heard in order)' ) as string,
						value: 'serial',
					},
				],
			},
		],
		[ translate ]
	);

	const detailsForm = useMemo(
		() => ( {
			layout: { type: 'regular' as const },
			fields: [ 'title', 'summary', 'host', 'copyright', 'language' ],
		} ),
		[]
	);

	const feedSettingsForm = useMemo(
		() => ( {
			layout: { type: 'regular' as const },
			fields: [ 'topic1', 'topic2', 'topic3', 'explicit', 'email', 'showType' ],
		} ),
		[]
	);

	const handleChange = ( edits: Partial< PodcastFormData > ) => {
		setFormData( ( data ) => ( { ...data, ...edits } ) );
	};

	const missingFields = useMemo( () => {
		const missing: string[] = [];
		if ( ! formData.title.trim() ) {
			missing.push( translate( 'a show title' ) as string );
		}
		if ( ! formData.summary.trim() ) {
			missing.push( translate( 'a summary' ) as string );
		}
		if ( ! hasCover ) {
			missing.push( translate( 'cover art' ) as string );
		}
		if ( ! formData.email.trim() ) {
			missing.push( translate( 'a contact email' ) as string );
		}
		return missing;
	}, [ formData.title, formData.summary, formData.email, hasCover, translate ] );

	return (
		<>
			{ missingFields.length === 0 ? (
				<Card className="site-settings__card podcast__card">
					<CardBody>
						<HStack alignment="center" justify="space-between" spacing={ 4 }>
							<VStack spacing={ 1 }>
								<Text weight={ 600 }>{ translate( 'Ready to record?' ) }</Text>
								<Text variant="muted">
									{ translate(
										'To create an episode, add an audio block to a post and assign it to your podcast category.'
									) }
								</Text>
							</VStack>
							<Button variant="primary">{ translate( 'Create episode' ) }</Button>
						</HStack>
					</CardBody>
				</Card>
			) : (
				<Notice status="warning" isDismissible={ false }>
					{ translate(
						'Add %(fields)s below to finish setting up your podcast. Directories will reject your feed until these are filled in.',
						{ args: { fields: missingFields.join( ', ' ) } }
					) }
				</Notice>
			) }

			<Card className="site-settings__card podcast__card">
				<CardBody>
					<VStack spacing={ 3 }>
						<Text as="h3" className="podcast__card-title">
							{ translate( 'Podcast category' ) }
						</Text>
						{ hasPickedCategory && ! categoryPickerOpen ? (
							<Text variant="muted">
								{ translate(
									'Posts published in the %(category)s category are included in your feed.',
									{ args: { category } }
								) }{ ' ' }
								<button
									type="button"
									className="podcast__inline-link"
									onClick={ () => setCategoryPickerOpen( true ) }
								>
									{ translate( 'Change category' ) }
								</button>
								.
							</Text>
						) : (
							<Text variant="muted">
								{ translate(
									'Choose the category that contains your podcast episodes. New posts in this category will appear in your feed.'
								) }
							</Text>
						) }

						{ ( ! hasPickedCategory || categoryPickerOpen ) && (
							<div className="podcast__category-picker">
								<RadioControl
									selected={ category }
									options={ SITE_CATEGORIES.map( ( value ) => ( { label: value, value } ) ) }
									onChange={ ( value ) => {
										setCategory( value );
										setHasPickedCategory( true );
										setCategoryPickerOpen( false );
									} }
								/>
								<div className="podcast__category-picker-actions">
									<Button variant="secondary">{ translate( 'Add category' ) }</Button>
									{ hasPickedCategory && (
										<Button variant="tertiary" onClick={ () => setCategoryPickerOpen( false ) }>
											{ translate( 'Cancel' ) }
										</Button>
									) }
								</div>
							</div>
						) }
					</VStack>
				</CardBody>
			</Card>

			<Card className="site-settings__card podcast__card">
				<CardBody>
					<VStack spacing={ 4 }>
						<Text as="h3" className="podcast__card-title">
							{ translate( 'Podcast details' ) }
						</Text>
						<Text as="p" variant="muted">
							{ translate(
								'This information appears in podcast apps like Apple Podcasts and Spotify.'
							) }
						</Text>
						<div className="podcast__cover-fieldset">
							<Text as="label">{ translate( 'Cover image' ) }</Text>
							<button
								type="button"
								className={ `podcast__cover-preview${ hasCover ? ' has-image' : ' is-blank' }` }
								aria-label={
									hasCover
										? ( translate( 'Change cover image' ) as string )
										: ( translate( 'Add cover image' ) as string )
								}
								onClick={ () => setHasCover( ( value ) => ! value ) }
							>
								{ hasCover ? (
									<span className="podcast__cover-thumb" aria-hidden="true" />
								) : (
									<span className="podcast__cover-placeholder">
										{ translate( 'No image set' ) }
									</span>
								) }
							</button>
							<div className="podcast__cover-actions">
								<Button variant="secondary" onClick={ () => setHasCover( ( value ) => ! value ) }>
									{ hasCover ? translate( 'Change' ) : translate( 'Add' ) }
								</Button>
								{ hasCover && (
									<Button variant="tertiary" isDestructive onClick={ () => setHasCover( false ) }>
										{ translate( 'Remove' ) }
									</Button>
								) }
							</div>
						</div>
						<div className="podcast__form-pane">
							<DataForm< PodcastFormData >
								data={ formData }
								fields={ fields }
								form={ detailsForm }
								onChange={ handleChange }
							/>
						</div>
					</VStack>
				</CardBody>
			</Card>

			<Card className="site-settings__card podcast__card">
				<CardBody>
					<VStack spacing={ 4 }>
						<Text as="h3" className="podcast__card-title">
							{ translate( 'Feed settings' ) }
						</Text>
						<Text as="p" variant="muted">
							{ translate( 'Configure how your podcast appears in directories and apps.' ) }
						</Text>
						<div className="podcast__form-pane">
							<DataForm< PodcastFormData >
								data={ formData }
								fields={ fields }
								form={ feedSettingsForm }
								onChange={ handleChange }
							/>
						</div>
					</VStack>
				</CardBody>
			</Card>
		</>
	);
}

export default Settings;
