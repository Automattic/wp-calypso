/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import domReady from '@wordpress/dom-ready';
import ReactDOM from 'react-dom';
import { useState, createInterpolateElement } from '@wordpress/element';
import { withNotices, Notice } from '@wordpress/components';
import url from 'url';
/* eslint-enable import/no-extraneous-dependencies */

const parsedEditorUrl = url.parse( window.location.href, true );

const ClassicEditorNotice = () => {
	const [ noticedDismissed, setNoticeDismissed ] = useState( false );

	const dismissNotice = () => {
		setNoticeDismissed( true );
		if ( window.localStorage ) {
			window.localStorage.setItem( 'dismissedClassicEditorNotice', true );
		}
	};

	const noticeText = createInterpolateElement(
		'If you prefer the Classic editor, you can always switch. Open the options menu by clicking on the button at the top right of your screen, and select <strong>Switch to Classic editor</strong>.',
		{ strong: <strong /> }
	);

	const noticeContent = (
		<div>
			<h2>{ __( "You're using the most modern WordPress Editor." ) } </h2>
			<p>{ noticeText }</p>
		</div>
	);

	return (
		! noticedDismissed && (
			<Notice
				className="features__switch-to-classic-notice"
				status="info"
				isDismissible={ true }
				onRemove={ dismissNotice }
			>
				{ noticeContent }
			</Notice>
		)
	);
};

const NoticeComponent = withNotices( ClassicEditorNotice );

const noticeDismissed = window.localStorage
	? window.localStorage.getItem( 'dismissedClassicEditorNotice' )
	: null;

if ( parsedEditorUrl.query[ 'show-classic-notice' ] && ! noticeDismissed ) {
	domReady( () => {
		const editInception = setInterval( () => {
			// Cycle through interval until postStatus is found.
			const postStatus = document.querySelector( '.components-panel__body.edit-post-post-status' );

			if ( ! postStatus ) {
				return;
			}

			clearInterval( editInception );

			const switchToClassicNotice = document.createElement( 'div' );
			switchToClassicNotice.className = 'edit-post-switch-to-classic-notice';
			postStatus.parentNode.insertBefore( switchToClassicNotice, postStatus );

			ReactDOM.render( <NoticeComponent />, switchToClassicNotice );
		} );
	} );
}
