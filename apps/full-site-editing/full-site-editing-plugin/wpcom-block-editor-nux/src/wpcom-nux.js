/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { ExternalLink, Guide, GuidePage } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, __experimentalCreateInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import {
	CanvasImage,
	EditorImage,
	BlockLibraryImage,
	DocumentationImage,
	InserterIconImage,
} from './images';

function WpcomNux() {
	const { isWpcomNuxEnabled, isSPTOpen } = useSelect( select => ( {
		isWpcomNuxEnabled: select( 'automattic/nux' ).isWpcomNuxEnabled(),
		isSPTOpen:
			select( 'automattic/starter-page-layouts' ) && // Handle the case where SPT is not initalized.
			select( 'automattic/starter-page-layouts' ).isOpen(),
	} ) );

	const { setWpcomNuxStatus } = useDispatch( 'automattic/nux' );

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

	if ( ! isWpcomNuxEnabled || isSPTOpen ) {
		return null;
	}

	const dismissWpcomNux = () => setWpcomNuxStatus( { isNuxEnabled: false } );

	/**
	 * Currently, the Guide content is mostly copied from Gutenberg. This can be
	 * updated if/as we have new designs for the NUX on wpcom.
	 */
	return (
		<Guide
			className="edit-post-welcome-guide"
			contentLabel={ __( 'Welcome to the WordPress editor' ) }
			finishButtonText={ __( 'Get started' ) }
			onFinish={ dismissWpcomNux }
		>
			<GuidePage className="edit-post-welcome-guide__page">
				<h1 className="edit-post-welcome-guide__heading">
					{ __( 'Welcome to the WordPress editor' ) }
				</h1>
				<CanvasImage className="edit-post-welcome-guide__image" />
				<p className="edit-post-welcome-guide__text">
					{ __(
						'In the WordPress editor, each paragraph, image, or video is presented as a distinct “block” of content.'
					) }
				</p>
			</GuidePage>

			<GuidePage className="edit-post-welcome-guide__page">
				<h1 className="edit-post-welcome-guide__heading">{ __( 'Make each block your own' ) }</h1>
				<EditorImage className="edit-post-welcome-guide__image" />
				<p className="edit-post-welcome-guide__text">
					{ __(
						'Each block comes with its own set of controls for changing things like color, width, and alignment. These will show and hide automatically when you have a block selected.'
					) }
				</p>
			</GuidePage>

			<GuidePage className="edit-post-welcome-guide__page">
				<h1 className="edit-post-welcome-guide__heading">
					{ __( 'Get to know the block library' ) }
				</h1>
				<BlockLibraryImage className="edit-post-welcome-guide__image" />
				<p className="edit-post-welcome-guide__text">
					{ __experimentalCreateInterpolateElement(
						__(
							'All of the blocks available to you live in the block library. You’ll find it wherever you see the <InserterIconImage /> icon.'
						),
						{
							InserterIconImage: (
								<InserterIconImage className="edit-post-welcome-guide__inserter-icon" />
							),
						}
					) }
				</p>
			</GuidePage>

			<GuidePage className="edit-post-welcome-guide__page">
				<h1 className="edit-post-welcome-guide__heading">
					{ __( 'Learn how to use the WordPress editor' ) }
				</h1>
				<DocumentationImage className="edit-post-welcome-guide__image" />
				<p className="edit-post-welcome-guide__text">
					{ __( 'New to the WordPress editor? Want to learn more about using it? ' ) }
					<ExternalLink href={ __( 'https://support.wordpress.com/wordpress-editor/' ) }>
						{ __( "Here's a detailed guide." ) }
					</ExternalLink>
				</p>
			</GuidePage>
		</Guide>
	);
}

// Only register plugin if these features are available.
// If registered without this check, atomic sites without gutenberg enabled will error when loading the editor.
// These seem to be the only dependencies here that are not supported there.
if ( __experimentalCreateInterpolateElement && Guide && GuidePage ) {
	registerPlugin( 'wpcom-block-editor-nux', {
		render: () => <WpcomNux />,
	} );
}
