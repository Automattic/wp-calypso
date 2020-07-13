/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { createInterpolateElement, useState } from '@wordpress/element';
import { Guide } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import url from 'url';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import { ClassicBlockImage, InserterImage, InserterIconImage } from './images';

const parsedEditorUrl = url.parse( globalThis.location.href, true );
const storageKey = `classic_block_guide_${ globalThis._currentSiteId }_is_dismissed`;

const ClassicGuide = () => {
	const [ isOpen, setOpen ] = useState( true );

	const closeGuide = () => {
		globalThis.localStorage.setItem( storageKey, 'true' );

		setOpen( false );
	};

	// Make sure we don't end up with the standard wpcom nux showing as well.
	const { setWpcomNuxStatus } = useDispatch( 'automattic/nux' );
	setWpcomNuxStatus( { isNuxEnabled: false } );

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<>
			{ isOpen && (
				<Guide
					className="edit-post-welcome-guide"
					onFinish={ closeGuide }
					finishButtonText={ __( 'Get started' ) }
					pages={ [
						{
							image: <ClassicBlockImage />,
							content: (
								<>
									<h1 className="use-classic-block-guide__heading edit-post-welcome-guide__heading">
										{ __( 'Meet the Classic block' ) }
									</h1>
									<p className="edit-post-welcome-guide__text">
										{ __(
											'The block editor is now the default editor for all your sites, but you can still use the Classic block, if you prefer.'
										) }
									</p>
								</>
							),
						},
						{
							image: <InserterImage />,
							content: (
								<>
									<h1 className="use-classic-block-guide__heading edit-post-welcome-guide__heading">
										{ __( 'Add the Classic block' ) }
									</h1>
									<p className="edit-post-welcome-guide__text">
										{ createInterpolateElement(
											__(
												'To use the classic block, click on the <InserterIconImage /> button at the top of the screen, search for Classic and insert the block.'
											),
											{
												InserterIconImage: (
													<InserterIconImage className="edit-post-welcome-guide__inserter-icon" />
												),
											}
										) }
									</p>
								</>
							),
						},
					] }
				/>
			) }
		</>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

const guideDismissed = globalThis.localStorage.getItem( storageKey );

if ( parsedEditorUrl.query[ 'in-editor-deprecation-group' ] && ! guideDismissed ) {
	registerPlugin( 'wpcom-classic-block-editor-nux', {
		render: () => <ClassicGuide />,
	} );
}
