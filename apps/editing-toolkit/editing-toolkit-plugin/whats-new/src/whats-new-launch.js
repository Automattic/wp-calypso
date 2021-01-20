/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { ExternalLink, Guide } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import paymentsImage from './images/payments.png';
import whatsappImage from './images/whatsapp.png';
import { store } from './store';

export default function WhatsNew() {
	// const isActive = useSelect( ( select ) => select( 'whats-new' ).isWhatsNewActive() );
	// // console.log(`Is active:  ${isActive}`);

	const { toggleWhatsNew } = useDispatch( store );

	// if ( ! isActive ) {
	// 	return null;
	// }

	return (
		<Guide
			className="edit-post-welcome-guide"
			contentLabel={ __( 'Welcome to the block editor', 'full-site-editing' ) }
			finishButtonText={ __( 'Get started', 'full-site-editing' ) }
			onFinish={ () => toggleWhatsNew() }
			pages={ [
				{
					image: paymentsImage,
					content: (
						<>
							<h1 className="edit-post-welcome-guide__heading">
								{ __( 'Welcome to the block editor', 'full-site-editing' ) }
							</h1>
							<p className="edit-post-welcome-guide__text">
								{ __(
									'In the WordPress editor, each paragraph, image, or video is presented as a distinct “block” of content.',
									'full-site-editing'
								) }
							</p>
						</>
					),
				},
				{
					image: whatsappImage,
					content: (
						<>
							<h1 className="edit-post-welcome-guide__heading">
								{ __( 'Make each block your own', 'full-site-editing' ) }
							</h1>
							<p className="edit-post-welcome-guide__text">
								{ __(
									'Each block comes with its own set of controls for changing things like color, width, and alignment. These will show and hide automatically when you have a block selected.',
									'full-site-editing'
								) }
							</p>
						</>
					),
				},
			] }
		/>
	);
}
