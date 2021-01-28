/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { Guide, GuidePage } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
// import { registerPlugin } from '@wordpress/plugins';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getQueryArg } from '@wordpress/url';

/**
 * Internal dependencies
 */
import './style.scss';
import blockPickerImage from './images/block-picker.svg';
import editorImage from './images/editor.svg';
import editorPodcastImage from './images/editor-podcast.svg';
import transcriptionImage from './images/transcription.svg';
import previewImage from './images/preview.svg';
import privateImage from './images/private.svg';

function WpcomNux() {
	const { isWpcomNuxEnabled, isSPTOpen, site, isGuideManuallyOpened } = useSelect( ( select ) => ( {
		isWpcomNuxEnabled: select( 'automattic/nux' ).isWpcomNuxEnabled(),
		isSPTOpen:
			select( 'automattic/starter-page-layouts' ) && // Handle the case where SPT is not initalized.
			select( 'automattic/starter-page-layouts' ).isOpen(),
		site: select( 'automattic/site' ).getSite( window._currentSiteId ),
		isGuideManuallyOpened: select( 'automattic/nux' ).isGuideManuallyOpened(),
	} ) );

	const { closeGeneralSidebar } = useDispatch( 'core/edit-post' );
	const { setWpcomNuxStatus, setGuideOpenStatus } = useDispatch( 'automattic/nux' );

	// On mount check if the WPCOM NUX status exists in state, otherwise fetch it from the API.
	useEffect( () => {
		if ( typeof isWpcomNuxEnabled !== 'undefined' ) {
			return;
		}
		const fetchWpcomNuxStatus = async () => {
			const response = await apiFetch( { path: '/wpcom/v2/block-editor/nux' } );
			setWpcomNuxStatus( { isNuxEnabled: response.is_nux_enabled, bypassApi: true } );
		};
		fetchWpcomNuxStatus();
	}, [ isWpcomNuxEnabled, setWpcomNuxStatus ] );

	// Hide editor sidebar first time users sees the editor
	useEffect( () => {
		isWpcomNuxEnabled && closeGeneralSidebar();
	}, [ closeGeneralSidebar, isWpcomNuxEnabled ] );

	// Track opening of the NUX Guide
	useEffect( () => {
		if ( isWpcomNuxEnabled && ! isSPTOpen ) {
			recordTracksEvent( 'calypso_editor_wpcom_nux_open', {
				is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
				is_manually_opened: isGuideManuallyOpened,
			} );
		}
	}, [ isWpcomNuxEnabled, isSPTOpen, isGuideManuallyOpened ] );

	if ( ! isWpcomNuxEnabled || isSPTOpen ) {
		return null;
	}

	const dismissWpcomNux = () => {
		recordTracksEvent( 'calypso_editor_wpcom_nux_dismiss', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
		} );
		setWpcomNuxStatus( { isNuxEnabled: false } );
		setGuideOpenStatus( { isGuideManuallyOpened: false } );
	};

	const isPodcastingSite = !! site?.options?.anchor_podcast;
	const anchorEpisode = getQueryArg( window.location.href, 'anchor_episode' );
	const showPodcastingTutorial = isPodcastingSite && anchorEpisode;
	const nuxPages = getWpcomNuxPages( showPodcastingTutorial );
	return (
		<Guide
			className="wpcom-block-editor-nux"
			contentLabel={ __( 'Welcome to your website', 'full-site-editing' ) }
			finishButtonText={ __( 'Get started', 'full-site-editing' ) }
			onFinish={ dismissWpcomNux }
		>
			{ nuxPages.map( ( nuxPage, index ) => (
				<NuxPage
					key={ nuxPage.heading }
					pageNumber={ index + 1 }
					isLastPage={ index === nuxPages.length - 1 }
					{ ...nuxPage }
				/>
			) ) }
		</Guide>
	);
}

/**
 * This function returns a collection of NUX slide data
 *
 * @param showPodcastingTutorial bool Whether to show the tutorial steps for podcasting sites.
 * @returns { Array } a collection of <NuxPage /> props
 */
function getWpcomNuxPages( showPodcastingTutorial ) {
	if ( showPodcastingTutorial ) {
		return [
			{
				heading: __( 'Create your first episode', 'full-site-editing' ),
				description: __(
					'Let’s get your first episode set up and ready to share. It’ll remain private until you’re ready to launch.',
					'full-site-editing'
				),
				imgSrc: editorPodcastImage,
				alignBottom: true,
			},
			{
				heading: __( 'Add a text transcription', 'full-site-editing' ),
				description: __(
					'Add more accessible content to your episode. Edit the placeholder content on your page to add a transcript of your episode audio.',
					'full-site-editing'
				),
				imgSrc: transcriptionImage,
				alignBottom: true,
			},
			{
				heading: __( 'Preview your page as you go', 'full-site-editing' ),
				description: __(
					'This is a post page with your episode content. Click “Preview” to see your site the way your visitors will.',
					'full-site-editing'
				),
				imgSrc: previewImage,
				alignBottom: true,
			},
		];
	}
	return [
		{
			heading: __( 'Welcome to your website', 'full-site-editing' ),
			description: __(
				'Edit your homepage, add the pages you need, and change your site’s look and feel.',
				'full-site-editing'
			),
			imgSrc: editorImage,
			alignBottom: true,
		},
		{
			heading: __( 'Add or edit your content', 'full-site-editing' ),
			description: __(
				'Edit the placeholder content we’ve started you off with, or click the plus sign to add more content.',
				'full-site-editing'
			),
			imgSrc: blockPickerImage,
		},
		{
			heading: __( 'Preview your site as you go', 'full-site-editing' ),
			description: __(
				'As you edit your site content, click “Preview” to see your site the way your visitors will.',
				'full-site-editing'
			),
			imgSrc: previewImage,
			alignBottom: true,
		},
		{
			heading: __( 'Hidden until you’re ready', 'full-site-editing' ),
			description: __(
				'Your site will remain hidden until launched. Click “Launch” in the toolbar to share it with the world.',
				'full-site-editing'
			),
			imgSrc: privateImage,
			alignBottom: true,
		},
	];
}

function NuxPage( { pageNumber, isLastPage, alignBottom = false, heading, description, imgSrc } ) {
	useEffect( () => {
		recordTracksEvent( 'calypso_editor_wpcom_nux_slide_view', {
			slide_number: pageNumber,
			is_last_slide: isLastPage,
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
	return (
		<GuidePage className="wpcom-block-editor-nux__page">
			<div className="wpcom-block-editor-nux__text">
				<h1 className="wpcom-block-editor-nux__heading">{ heading }</h1>
				<div className="wpcom-block-editor-nux__description">{ description }</div>
			</div>
			<div className="wpcom-block-editor-nux__visual">
				<img
					// Force remount so the stale image doesn't remain while new image is fetched
					key={ imgSrc }
					src={ imgSrc }
					alt=""
					aria-hidden="true"
					className={ 'wpcom-block-editor-nux__image' + ( alignBottom ? ' align-bottom' : '' ) }
				/>
			</div>
		</GuidePage>
	);
}

// Only register plugin if these features are available.
// If registered without this check, atomic sites without gutenberg enabled will error when loading the editor.
// These seem to be the only dependencies here that are not supported there.
if ( Guide && GuidePage ) {
	// registerPlugin( 'wpcom-block-editor-nux', {
	// 	render: () => <WpcomNux />,
	// } );
}
