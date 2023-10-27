import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dialog } from '@automattic/components';
import { Button, CheckboxControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';

import './style.scss';

/**
 * Return true if the user is currently previewing a theme.
 * FIXME: This is copied from Gutenberg; we should be creating a selector for the `core/edit-site` store.
 * @see https://github.com/WordPress/gutenberg/blob/053c8f733c85d80c891fa308b071b9a18e5194e9/packages/edit-site/src/utils/is-previewing-theme.js#L6
 */
function isPreviewingTheme() {
	return getQueryArg( window.location.href, 'wp_theme_preview' ) !== undefined;
}

/**
 * Return the theme slug if the user is currently previewing a theme.
 * FIXME: This is copied from Gutenberg; we should be creating a selector for the `core/edit-site` store.
 * @see https://github.com/WordPress/gutenberg/blob/053c8f733c85d80c891fa308b071b9a18e5194e9/packages/edit-site/src/utils/is-previewing-theme.js#L6
 */
function currentlyPreviewingTheme() {
	if ( isPreviewingTheme() ) {
		return getQueryArg( window.location.href, 'wp_theme_preview' );
	}
	return null;
}

/**
 * This is an interim solution to educate users the first time they live-previewing a theme.
 * And this should be moved to jetpack-mu-wpcom.
 * @see https://github.com/Automattic/wp-calypso/issues/82187
 */
export default function LivePreviewModal() {
	const translate = useTranslate();

	const { suppressLivePreviewModal: suppressModal } = useDispatch(
		'automattic/wpcom-welcome-guide'
	);
	const isModalSuppressed = useSelect(
		( select ) =>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			( select( 'automattic/wpcom-welcome-guide' ) as any ).getIsLivePreviewModalSuppressed(),
		[]
	);

	const [ isModalOpen, setIsModalOpen ] = useState( isPreviewingTheme() && ! isModalSuppressed );
	const [ shouldSuppressModal, setShouldSuppressModal ] = useState( false );

	const themeSlug = currentlyPreviewingTheme();
	const theme = useSelect(
		( select ) =>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			( select( 'core' ) as any ).getTheme( themeSlug ),
		[]
	);
	const themeName = theme?.name?.rendered || themeSlug;

	const onClose = () => {
		setIsModalOpen( false );
		recordTracksEvent( 'calypso_block_theme_live_preview_modal_close_click', {
			theme: themeSlug,
		} );
	};

	const onContinue = () => {
		if ( shouldSuppressModal ) {
			suppressModal();
		}
		onClose();
		recordTracksEvent( 'calypso_block_theme_live_preview_modal_continue_click', {
			do_not_show_again: shouldSuppressModal,
			theme: themeSlug,
		} );
	};

	return (
		<Dialog
			className="live-preview-modal"
			additionalOverlayClassNames="live-preview-modal__overlay"
			isVisible={ isModalOpen }
			isFullScreen
		>
			<Button className="live-preview-modal__close-icon" onClick={ onClose }>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24" width="24">
					<path d="M18.36 19.78L12 13.41l-6.36 6.37-1.42-1.42L10.59 12 4.22 5.64l1.42-1.42L12 10.59l6.36-6.36 1.41 1.41L13.41 12l6.36 6.36z" />
				</svg>
			</Button>
			<h1>{ translate( 'Previewing %(themeName)s', { args: { themeName } } ) }</h1>
			<p>
				{ translate(
					'Welcome to the WordPress Editor. You will be previewing {{strong}}%(themeName)s{{/strong}} in the Editor with your site’s content. If you like what you see, you can {{strong}}Activate{{/strong}} the theme directly in the Editor.',
					{ args: { themeName }, components: { strong: <strong /> } }
				) }
			</p>
			<p>
				{ translate(
					'Most users find the {{strong}}Styles{{/strong}} and {{strong}}Pages{{/strong}} features particularly helpful in evaluating the look and feel of a new theme.',
					{ components: { strong: <strong /> } }
				) }
			</p>
			<p>
				{ translate(
					'To exit the Editor preview and go back to the theme showcase, click the small arrow next to {{strong}}Previewing{{/strong}} or the site icon in the top left corner.',
					{ components: { strong: <strong /> } }
				) }
			</p>
			<CheckboxControl
				className="live-preview-modal__checkbox"
				label={ translate( 'Do not show this modal again.' ) }
				checked={ shouldSuppressModal }
				onChange={ ( checked ) => {
					setShouldSuppressModal( checked );
				} }
			/>

			<Button variant="primary" onClick={ onContinue }>
				{ translate( 'Continue' ) }
			</Button>
		</Dialog>
	);
}
