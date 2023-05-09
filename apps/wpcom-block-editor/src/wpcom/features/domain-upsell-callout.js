import { getCalypsoUrl } from '@automattic/calypso-url';
import { dispatch, select, subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
import { close, globe, Icon } from '@wordpress/icons';
import { createElement } from 'react';
import { render } from 'react-dom';
import tracksRecordEvent from './tracking/track-record-event';

import './domain-upsell-callout.scss';

function whenEditorIsReady() {
	return new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {
			// This will trigger after the initial render blocking, before the window load event
			// This seems currently more reliable than using __unstableIsEditorReady
			if (
				select( 'core/editor' ).isCleanNewPost() ||
				select( 'core/block-editor' ).getBlockCount() > 0
			) {
				unsubscribe();
				resolve();
			}
		} );
	} );
}

// Check for post type and if the user has not dismissed the upsell
function shouldShowDomainUpsell() {
	const postType = select( 'core/editor' ).getCurrentPostType();
	const isDismissed = select( 'core/preferences' ).get(
		'core/edit-post',
		'domain_upsell_callout_dismiss'
	);
	return ! isDismissed && ( postType === 'post' || postType === 'page' );
}
function DomainUpsell() {
	const siteSlug = window.location.hostname;
	const target = getCalypsoUrl() === 'https://wordpress.com' ? '_parent' : '_self';
	const trackEventView = 'wpcom_block_editor_domain_upsell_callout_view';
	const trackEventClick = 'wpcom_block_editor_domain_upsell_callout_click';
	const trackEventDismiss = 'wpcom_block_editor_domain_upsell_callout_dismiss';
	tracksRecordEvent( trackEventView );

	function handleClick() {
		tracksRecordEvent( trackEventClick );
		window.open(
			`https://wordpress.com/domains/add/${ siteSlug }?domainAndPlanPackage=true`,
			target
		);
	}

	const handleDismiss = () => {
		tracksRecordEvent( trackEventDismiss );
		document.querySelector( '.domain-upsell-callout' ).remove();
		dispatch( 'core/preferences' ).set( 'core/edit-post', 'domain_upsell_callout_dismiss', true );
	};

	return (
		<div className="domain-upsell-callout">
			<div className="domain-upsell-callout__content">
				<div className="domain-upsell-callout__content-text">
					<Icon icon={ globe } size={ 16 } />
					<span className="domain-upsell-callout__domain-name">{ siteSlug }</span>
					{ /* We can only use <a> here because the button somehow just disappears from the page */ }
					{ /* eslint-disable-next-line */ }
					<a className="domain-upsell-callout__button" role="button" onClick={ handleClick }>
						<span className="domain-upsell-callout__button-text-desktop">
							{ __( 'Customize your domain' ) }
						</span>
						<span className="domain-upsell-callout__button-text-mobile">{ __( 'Customize' ) }</span>
					</a>
					<Icon
						icon={ close }
						className="domain-upsell-callout__dismiss-icon"
						onClick={ handleDismiss }
						size={ 16 }
					/>
				</div>
			</div>
		</div>
	);
}

domReady( async function () {
	await whenEditorIsReady();
	if ( shouldShowDomainUpsell() ) {
		const toolbarContainer = document.querySelector( '.edit-post-header-toolbar' );
		render( createElement( DomainUpsell ), toolbarContainer );
	}
} );
