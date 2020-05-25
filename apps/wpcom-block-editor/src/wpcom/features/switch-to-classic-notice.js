/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import domReady from '@wordpress/dom-ready';
import ReactDOM from 'react-dom';
import { useEffect, createInterpolateElement } from '@wordpress/element';
import { withNotices } from '@wordpress/components';
import url from 'url';
/* eslint-enable import/no-extraneous-dependencies */

const parsedEditorUrl = url.parse( window.location.href, true );
const dismissNotice = () => {
	console.log( 'Notice dismissed' );
	localStorage.setItem( 'dismissedClassicEditorNotice', 'true' );
};

const ClassicEditorNotice = ( { noticeOperations, noticeUI } ) => {
	const noticeText = createInterpolateElement(
		'If you prefer the Classic editor, you can always switch. Open the options menu by click in the button at the top right of your screen, and select <strong>Switch to Classic editor</strong>.',
		{ strong: <strong /> }
	);

	const noticeContent = (
		<div>
			<h2>{ __( "You're usng the most modern WordPress Editor." ) } </h2>
			<p>{ noticeText }</p>
		</div>
	);

	useEffect( () => {
		noticeOperations.createNotice( {
			className: 'edit-post-switch-to-classic-notice',
			status: 'info',
			content: noticeContent,
			isDismissible: true,
			onRemove: dismissNotice,
		} );
	}, [ noticeOperations ] );

	return <div>{ noticeUI }</div>;
};

const NoticeComponent = withNotices( ClassicEditorNotice );

const noticeDismissed = localStorage.getItem( 'dismissedClassicEditorNotice' );

// Need to replace this check with one that checks for a specific parsedEditorUrl.query param
// https://github.com/Automattic/wp-calypso/issues/41087.
if ( parsedEditorUrl.query[ 'environment-id' ] === 'stage' && noticeDismissed !== 'true' ) {
	domReady( () => {
		const editInception = setInterval( () => {
			// Cycle through interval until sidebar is found.
			const sidebar = document.querySelector( '.components-panel__body.edit-post-post-status' );

			if ( ! sidebar ) {
				return;
			}

			clearInterval( editInception );

			sidebar.classList.add( 'show-classic-editor-notice' );

			const switchToClassicNotice = document.createElement( 'div' );
			switchToClassicNotice.className = 'edit-post-switch-to-classic-notice';
			sidebar.after( switchToClassicNotice );

			ReactDOM.render( <NoticeComponent />, switchToClassicNotice );
		} );
	} );
}
