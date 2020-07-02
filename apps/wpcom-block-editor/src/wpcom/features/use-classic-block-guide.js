/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { useState } from '@wordpress/element';
import { Guide } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import url from 'url';
import { translate } from 'i18n-calypso';
import { registerPlugin } from '@wordpress/plugins';
/* eslint-enable import/no-extraneous-dependencies */

const parsedEditorUrl = url.parse( window.location.href, true );

const ClassicGuide = () => {
	const [ isOpen, setOpen ] = useState( true );

	const closeGuide = () => setOpen( false );

	// Make sure we don't end up with the standard wpcom nux showing as well.
	const { setWpcomNuxStatus } = useDispatch( 'automattic/nux' );
	setWpcomNuxStatus( { isNuxEnabled: false } );

	return (
		<>
			{ isOpen && (
				<Guide
					onFinish={ closeGuide }
					finishButtonText={ translate( 'Get started' ) }
					pages={ [
						{
							content: (
								<div className="use-classic-block-guide__wrapper">
									<div className="use-classic-block-guide__content">
										<h1 className="use-classic-block-guide__header">
											{ translate( 'Say hello to the Classic block' ) }
										</h1>
										<p>
											{ translate(
												'The block editor is now the default editor for all your sites, but you can still use the Classic block, if you prefer.'
											) }
										</p>
									</div>
									<div>
										<img
											alt="Screenshot of the Classic block"
											className="use-classic-block-guide__image"
											src="https://s0.wp.com/i/classic-block-welcome.png"
										/>
									</div>
								</div>
							),
						},
					] }
				/>
			) }
		</>
	);
};

// Hard coding these values for now - query string can be passed in from client/gutenberg/editor/calypsoify-iframe.tsx
const guideDismissed = false;
parsedEditorUrl.query[ 'show-classic-block-guide' ] = true;

if ( parsedEditorUrl.query[ 'show-classic-block-guide' ] && ! guideDismissed ) {
	registerPlugin( 'wpcom-classic-block-editor-nux', {
		render: () => <ClassicGuide />,
	} );
}
