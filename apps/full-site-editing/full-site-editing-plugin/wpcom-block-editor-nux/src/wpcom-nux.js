/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { Guide, GuidePage } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, __experimentalCreateInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

function WpcomNux() {
	const isWpcomNuxEnabled = useSelect( select => select( 'automattic/nux' ).isWpcomNuxEnabled() );

	const { setWpcomNuxStatus } = useDispatch( 'automattic/nux' );

	useEffect( () => {
		if ( typeof isWpcomNuxEnabled !== 'undefined' ) {
			return;
		}
		const fetchWpcomNuxStatus = async () => {
			const response = await apiFetch( {
				path: 'fse/v1/wpcom-block-editor/nux',
			} );
			setWpcomNuxStatus( response.is_nux_enabled );
		};
		fetchWpcomNuxStatus();
	}, [ isWpcomNuxEnabled, setWpcomNuxStatus ] );

	if ( ! isWpcomNuxEnabled ) {
		return null;
	}

	const dismissWpcomNux = () => {
		setWpcomNuxStatus( false );
		apiFetch( {
			path: 'fse/v1/wpcom-block-editor/nux',
			method: 'POST',
			data: { isNuxEnabled: false },
		} );
	};

	return (
		<Guide
			className="edit-post-welcome-guide"
			finishButtonText={ __( 'Get started' ) }
			onFinish={ dismissWpcomNux }
		>
			<GuidePage className="edit-post-welcome-guide__page">
				<h1 className="edit-post-welcome-guide__heading">
					{ __( 'Welcome to the Block Editor' ) }
				</h1>
				<p className="edit-post-welcome-guide__text">
					{ __(
						'In the WordPress editor, each paragraph, image, or video is presented as a distinct “block” of content.'
					) }
				</p>
			</GuidePage>
			<GuidePage className="edit-post-welcome-guide__page">
				<h1 className="edit-post-welcome-guide__heading">{ __( 'Make each block your own' ) }</h1>
				<p className="edit-post-welcome-guide__text">
					{ __(
						'Each block comes with its own set of controls for changing things like color, width, and alignment. These will show and hide automatically when you have a block selected.'
					) }
				</p>
			</GuidePage>
			<GuidePage className="edit-post-welcome-guide__page">
				<h1 className="edit-post-welcome-guide__heading">
					{ __( 'Get to know the Block Library' ) }
				</h1>
				<p className="edit-post-welcome-guide__text">
					{ __experimentalCreateInterpolateElement(
						__(
							'All of the blocks available to you live in the Block Library. You’ll find it wherever you see the <InserterIconImage /> icon.'
						),
						{
							InserterIconImage: (
								<img
									alt={ __( 'inserter' ) }
									src="data:image/svg+xml;charset=utf8,%3Csvg width='18' height='18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8.824 0C3.97 0 0 3.97 0 8.824c0 4.853 3.97 8.824 8.824 8.824 4.853 0 8.824-3.971 8.824-8.824S13.677 0 8.824 0zM7.94 5.294v2.647H5.294v1.765h2.647v2.647h1.765V9.706h2.647V7.941H9.706V5.294H7.941zm-6.176 3.53c0 3.882 3.176 7.059 7.059 7.059 3.882 0 7.059-3.177 7.059-7.06 0-3.882-3.177-7.058-7.06-7.058-3.882 0-7.058 3.176-7.058 7.059z' fill='%234A4A4A'/%3E%3Cmask id='a' maskUnits='userSpaceOnUse' x='0' y='0' width='18' height='18'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8.824 0C3.97 0 0 3.97 0 8.824c0 4.853 3.97 8.824 8.824 8.824 4.853 0 8.824-3.971 8.824-8.824S13.677 0 8.824 0zM7.94 5.294v2.647H5.294v1.765h2.647v2.647h1.765V9.706h2.647V7.941H9.706V5.294H7.941zm-6.176 3.53c0 3.882 3.176 7.059 7.059 7.059 3.882 0 7.059-3.177 7.059-7.06 0-3.882-3.177-7.058-7.06-7.058-3.882 0-7.058 3.176-7.058 7.059z' fill='%23fff'/%3E%3C/mask%3E%3Cg mask='url(%23a)'%3E%3Cpath fill='%23444' d='M0 0h17.644v17.644H0z'/%3E%3C/g%3E%3C/svg%3E"
									className="edit-post-welcome-guide__inserter-icon"
								/>
							),
						}
					) }
				</p>
			</GuidePage>
		</Guide>
	);
}

registerPlugin( 'wpcom-block-editor-nux', {
	render: () => <WpcomNux />,
} );
