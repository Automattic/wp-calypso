import './style.scss';

import { Button, Card, FormLabel } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useEffect, useMemo, useRef, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import PodcastingWelcome, { type PlanTier } from './welcome';

type Status = 'idle' | 'saving' | 'saved';

const SITE_CATEGORIES = [
	'Alpacas',
	'Cerros',
	'Llamas',
	'Podcast',
	'Sipo',
	'Travel',
	'Uncategorized',
];

type PodcastingV2BodyProps = {
	podcastingOn: boolean;
	onChangePodcasting: ( on: boolean ) => void;
	/**
	 * When true, skip chrome that doesn't belong inside a tabbed wrapper:
	 * the enable-toggle card (wrapper controls enable), the prototype notice,
	 * and the prototype toggle. Defaults to false for the standalone page.
	 */
	embedded?: boolean;
};

export function PodcastingV2Body( {
	podcastingOn,
	onChangePodcasting,
	embedded = false,
}: PodcastingV2BodyProps ) {
	const [ title, setTitle ] = useState( "Look Ma, It's a Podcast" );
	const [ summary, setSummary ] = useState(
		'A weekly show about shipping fast at WordPress.com during Radical Speed Month.'
	);
	const [ host, setHost ] = useState( 'Rob Pugh & Tony Arcangelini' );
	const [ copyright, setCopyright ] = useState( '© 2026 Automattic' );
	const [ topic1, setTopic1 ] = useState( 'Technology' );
	const [ topic2, setTopic2 ] = useState( 'Business » Entrepreneurship' );
	const [ topic3, setTopic3 ] = useState( 'None' );
	const [ explicit, setExplicit ] = useState( 'no' );
	const [ email, setEmail ] = useState( 'rob.pugh@automattic.com' );
	const [ language, setLanguage ] = useState( 'en-us' );
	const [ showType, setShowType ] = useState( 'episodic' );
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
	}, [
		podcastingOn,
		title,
		summary,
		host,
		copyright,
		topic1,
		topic2,
		topic3,
		explicit,
		email,
		language,
		showType,
		hasCover,
		category,
	] );

	const missingFields = useMemo( () => {
		const missing: string[] = [];
		if ( ! title.trim() ) {
			missing.push( 'a show title' );
		}
		if ( ! summary.trim() ) {
			missing.push( 'a summary' );
		}
		if ( ! hasCover ) {
			missing.push( 'cover art' );
		}
		if ( ! email.trim() ) {
			missing.push( 'a contact email' );
		}
		return missing;
	}, [ title, summary, hasCover, email ] );

	if ( ! podcastingOn ) {
		return null;
	}

	return (
		<>
			{ /* Enable toggle — lets users disable from within Settings.
			     Hidden in embedded mode when the wrapper already exposes an off-switch. */ }
			{ ! embedded && (
				<Card className="site-settings__card podcasting-v2__card">
					<ToggleControl
						checked={ podcastingOn }
						onChange={ onChangePodcasting }
						label="Enable podcasting on this site"
						__nextHasNoMarginBottom
					/>
					<FormSettingExplanation>
						Disable to stop publishing your podcast feed. You can always set it up again.
					</FormSettingExplanation>
				</Card>
			) }

			{ /* Top action bar — Create Episode once ready, guidance before then */ }
			{ missingFields.length === 0 ? (
				<Card className="site-settings__card podcasting-v2__card podcasting-v2__create-bar">
					<div className="podcasting-v2__create-bar-body">
						<strong>Ready to record?</strong>
						<FormSettingExplanation>
							To create an episode, add an audio block to a post and assign it to your podcast
							category.
						</FormSettingExplanation>
					</div>
					<Button primary>Create episode</Button>
				</Card>
			) : (
				<Card className="site-settings__card podcasting-v2__card podcasting-v2__create-bar">
					<div className="podcasting-v2__create-bar-body">
						<strong>Finish setting up your podcast</strong>
						<FormSettingExplanation>
							Add { missingFields.join( ', ' ) } below. Once your show is ready, you can create your
							first episode from here.
						</FormSettingExplanation>
					</div>
				</Card>
			) }

			{ /* Podcast category */ }
			<Card className="site-settings__card podcasting-v2__card">
				<h3 className="podcasting-v2__card-title">Podcast category</h3>
				{ hasPickedCategory && ! categoryPickerOpen ? (
					<FormSettingExplanation>
						Posts published in the <strong>{ category }</strong> category are included in your feed.{ ' ' }
						<button
							type="button"
							className="podcasting-v2__inline-link"
							onClick={ () => setCategoryPickerOpen( true ) }
						>
							Change category
						</button>
						.
					</FormSettingExplanation>
				) : (
					<FormSettingExplanation>
						Choose the category that contains your podcast episodes. New posts in this category will
						appear in your feed.
					</FormSettingExplanation>
				) }
				{ ( ! hasPickedCategory || categoryPickerOpen ) && (
					<FormFieldset className="podcasting-v2__category-picker">
						<ul className="podcasting-v2__category-list">
							{ SITE_CATEGORIES.map( ( c ) => (
								<li key={ c }>
									<FormLabel>
										<FormRadio
											checked={ category === c }
											onChange={ () => {
												setCategory( c );
												setHasPickedCategory( true );
												setCategoryPickerOpen( false );
											} }
											label={ c }
										/>
									</FormLabel>
								</li>
							) ) }
						</ul>
						<div className="podcasting-v2__category-picker-actions">
							<Button compact>Add category</Button>
							{ hasPickedCategory && (
								<Button compact onClick={ () => setCategoryPickerOpen( false ) }>
									Cancel
								</Button>
							) }
						</div>
					</FormFieldset>
				) }
			</Card>

			{ /* Podcast details */ }
			<Card className="site-settings__card podcasting-v2__card">
				<h3 className="podcasting-v2__card-title">Podcast details</h3>
				<FormSettingExplanation>
					This information appears in podcast apps like Apple Podcasts and Spotify.
				</FormSettingExplanation>
				<div className="podcasting-v2__cover-and-info">
					<FormFieldset className="podcasting-v2__cover-fieldset">
						<FormLabel>Cover image</FormLabel>
						<button
							type="button"
							className={ `podcasting-v2__cover-preview${ hasCover ? ' has-image' : ' is-blank' }` }
							aria-label={ hasCover ? 'Change cover image' : 'Add cover image' }
							onClick={ () => setHasCover( ( c ) => ! c ) }
						>
							{ hasCover ? (
								<span className="podcasting-v2__cover-thumb" aria-hidden="true" />
							) : (
								<span className="podcasting-v2__cover-placeholder">No image set</span>
							) }
						</button>
						<div className="podcasting-v2__cover-actions">
							<Button compact onClick={ () => setHasCover( ( c ) => ! c ) }>
								{ hasCover ? 'Change' : 'Add' }
							</Button>
							{ hasCover && (
								<Button compact scary onClick={ () => setHasCover( false ) }>
									Remove
								</Button>
							) }
						</div>
					</FormFieldset>
					<div className="podcasting-v2__title-subtitle-wrapper">
						<FormFieldset>
							<FormLabel htmlFor="podcasting_title">Title</FormLabel>
							<FormInput
								id="podcasting_title"
								name="podcasting_title"
								value={ title }
								onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
									setTitle( e.target.value )
								}
							/>
						</FormFieldset>
						<FormFieldset>
							<FormLabel htmlFor="podcasting_summary">Summary/Description</FormLabel>
							<FormTextarea
								id="podcasting_summary"
								name="podcasting_summary"
								value={ summary }
								onChange={ ( e: React.ChangeEvent< HTMLTextAreaElement > ) =>
									setSummary( e.target.value )
								}
							/>
						</FormFieldset>
					</div>
				</div>
				<FormFieldset>
					<FormLabel htmlFor="podcasting_talent_name">Hosts/Artist/Producer</FormLabel>
					<FormInput
						id="podcasting_talent_name"
						name="podcasting_talent_name"
						value={ host }
						onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => setHost( e.target.value ) }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="podcasting_copyright">Copyright</FormLabel>
					<FormInput
						id="podcasting_copyright"
						name="podcasting_copyright"
						value={ copyright }
						onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
							setCopyright( e.target.value )
						}
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="language">Language</FormLabel>
					<FormSelect
						id="language"
						value={ language }
						onChange={ ( e: React.ChangeEvent< HTMLSelectElement > ) =>
							setLanguage( e.target.value )
						}
					>
						<option value="en-us">English (US)</option>
						<option value="en-gb">English (UK)</option>
						<option value="es">Spanish</option>
						<option value="pt-br">Portuguese (BR)</option>
					</FormSelect>
				</FormFieldset>
			</Card>

			{ /* Feed settings */ }
			<Card className="site-settings__card podcasting-v2__card">
				<h3 className="podcasting-v2__card-title">Feed settings</h3>
				<FormSettingExplanation>
					Configure how your podcast appears in directories and apps.
				</FormSettingExplanation>
				<FormFieldset>
					<FormLabel htmlFor="topic1">Podcast topics</FormLabel>
					<FormSettingExplanation>
						Choose how your podcast should be categorized within Apple Podcasts and other podcasting
						services.
					</FormSettingExplanation>
					<div className="podcasting-v2__topic-stack">
						<FormSelect
							id="topic1"
							value={ topic1 }
							onChange={ ( e: React.ChangeEvent< HTMLSelectElement > ) =>
								setTopic1( e.target.value )
							}
						>
							<option>Technology</option>
							<option>Business</option>
							<option>Arts</option>
							<option>News</option>
						</FormSelect>
						<FormSelect
							id="topic2"
							value={ topic2 }
							onChange={ ( e: React.ChangeEvent< HTMLSelectElement > ) =>
								setTopic2( e.target.value )
							}
						>
							<option>None</option>
							<option>Business » Entrepreneurship</option>
							<option>Technology » Software How-To</option>
						</FormSelect>
						<FormSelect
							id="topic3"
							value={ topic3 }
							onChange={ ( e: React.ChangeEvent< HTMLSelectElement > ) =>
								setTopic3( e.target.value )
							}
						>
							<option>None</option>
							<option>News » Tech News</option>
							<option>Business » Management</option>
						</FormSelect>
					</div>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="podcasting_explicit">Explicit content</FormLabel>
					<FormSelect
						id="podcasting_explicit"
						value={ explicit }
						onChange={ ( e: React.ChangeEvent< HTMLSelectElement > ) =>
							setExplicit( e.target.value )
						}
					>
						<option value="no">No</option>
						<option value="yes">Yes</option>
						<option value="clean">Clean</option>
					</FormSelect>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="podcasting_email">Email address</FormLabel>
					<FormSettingExplanation>
						This email address will be displayed in the feed and is required for some services such
						as Google Play.
					</FormSettingExplanation>
					<FormInput
						id="podcasting_email"
						type="email"
						value={ email }
						onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => setEmail( e.target.value ) }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="show-type">Show type</FormLabel>
					<FormSettingExplanation>
						Episodic is right for most shows. Pick Serial if episodes should be heard in order.
					</FormSettingExplanation>
					<FormSelect
						id="show-type"
						value={ showType }
						onChange={ ( e: React.ChangeEvent< HTMLSelectElement > ) =>
							setShowType( e.target.value )
						}
					>
						<option value="episodic">Episodic (newest episode first)</option>
						<option value="serial">Serial (meant to be heard in order)</option>
					</FormSelect>
				</FormFieldset>
			</Card>

			{ ! embedded && (
				<>
					<Notice
						status="is-info"
						showDismiss={ false }
						className="podcasting-v2__soft-notice podcasting-v2__prototype-notice"
						text="Prototype only. No changes are saved. Submission and listing status live on the Distribution tab."
					/>
					<p className="podcasting-v2__prototype-toggle">
						<button
							type="button"
							className="podcasting-v2__inline-link"
							onClick={ () => {
								setHasPickedCategory( ( v ) => ! v );
								setCategoryPickerOpen( false );
							} }
						>
							{ hasPickedCategory
								? 'Prototype: simulate first-time category picker'
								: 'Prototype: restore picked category' }
						</button>
					</p>
				</>
			) }
		</>
	);
}

function PodcastingV2() {
	const [ podcastingOn, setPodcastingOn ] = useState( false );
	const [ planTier, setPlanTier ] = useState< PlanTier >( 'free' );

	return (
		<Main className="podcasting-v2" wideLayout>
			<div className="podcasting-v2__page-head">
				<div>
					<h2 className="podcasting-v2__page-title">Podcasting</h2>
					<p className="podcasting-v2__page-lede">
						{ podcastingOn
							? 'Publish a podcast feed to Apple Podcasts and other podcasting services. Learn more.'
							: 'Publish audio alongside your writing. One feed, every podcast app.' }
					</p>
				</div>
			</div>

			{ ! podcastingOn && (
				<PodcastingWelcome
					onEnable={ () => setPodcastingOn( true ) }
					planTier={ planTier }
					onChangePlanTier={ setPlanTier }
				/>
			) }

			<PodcastingV2Body podcastingOn={ podcastingOn } onChangePodcasting={ setPodcastingOn } />
		</Main>
	);
}

export default PodcastingV2;
