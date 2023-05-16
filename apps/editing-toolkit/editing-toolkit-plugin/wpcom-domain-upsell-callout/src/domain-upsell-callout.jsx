import { recordTracksEvent } from '@automattic/calypso-analytics';
import { dispatch, select, subscribe } from '@wordpress/data';
import { render } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { close, globe, Icon } from '@wordpress/icons';
import useSiteIntent from '../../dotcom-fse/lib/site-intent/use-site-intent';

import './domain-upsell-callout.scss';

const isEditorReady = async () =>
	new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {
			// Calypso sends the message as soon as the iframe is loaded, so we
			// need to be sure that the editor is initialized and the core blocks
			// registered. There is an unstable selector for that, so we use
			// `isCleanNewPost` otherwise which is triggered when everything is
			// initialized if the post is new.
			const editorIsReady = select( 'core/editor' ).__unstableIsEditorReady
				? select( 'core/editor' ).__unstableIsEditorReady()
				: select( 'core/editor' ).isCleanNewPost();
			if ( editorIsReady ) {
				unsubscribe();
				resolve();
			}
		} );
	} );

const shouldShowDomainUpsell = () => {
	const postType = select( 'core/editor' ).getCurrentPostType();
	const isDismissed = select( 'core/preferences' ).get(
		'core/edit-post',
		'domain_upsell_callout_dismiss'
	);
	return ! isDismissed && ( postType === 'post' || postType === 'page' );
};

const DomainUpsellCallout = () => {
	const { siteIntent: intent, siteIntentFetched: intentFetched } = useSiteIntent();

	if ( ! intentFetched || intent ) {
		return;
	}

	const siteSlug = window.location.hostname;
	const target = '_parent';
	const trackEventView = 'calypso_block_editor_domain_upsell_callout_view';
	const trackEventClick = 'calypso_block_editor_domain_upsell_callout_click';
	const trackEventDismiss = 'calypso_block_editor_domain_upsell_callout_dismiss';
	recordTracksEvent( trackEventView );

	const handleClick = () => {
		recordTracksEvent( trackEventClick );
		window.open(
			`https://wordpress.com/domains/add/${ siteSlug }?domainAndPlanPackage=true`,
			target
		);
	};

	const handleDismiss = () => {
		recordTracksEvent( trackEventDismiss );
		document.querySelector( '.wpcom-domain-upsell-callout' ).remove();
		dispatch( 'core/preferences' ).set( 'core/edit-post', 'domain_upsell_callout_dismiss', true );
	};

	return (
		<>
			<div className="wpcom-domain-upsell-callout__content">
				<div className="wpcom-domain-upsell-callout__content-text">
					<Icon icon={ globe } size={ 16 } />
					<span className="wpcom-domain-upsell-callout__domain-name">{ siteSlug }</span>
					{ /* We can only use <a> here because the button somehow just disappears from the page */ }
					{ /* eslint-disable-next-line */ }
					<a className="wpcom-domain-upsell-callout__button" role="button" onClick={ handleClick }>
						<span className="wpcom-domain-upsell-callout__button-text-desktop">
							{ __( 'Customize your domain', 'full-site-editing' ) }
						</span>
						<span className="wpcom-domain-upsell-callout__button-text-mobile">
							{ __( 'Customize', 'full-site-editing' ) }
						</span>
					</a>
					<Icon
						icon={ close }
						className="wpcom-domain-upsell-callout__dismiss-icon"
						onClick={ handleDismiss }
						size={ 16 }
					/>
				</div>
			</div>
		</>
	);
};

async function showDomainUpsellCallout() {
	// We wait to the editor to be ready because showing an upsell before the editor could be shocking
	await isEditorReady();
	if ( shouldShowDomainUpsell() ) {
		const toolbarContainer = document.querySelector( '.edit-post-header-toolbar' );
		if ( toolbarContainer !== null ) {
			const domainUpsellContainer = document.createElement( 'div' );
			domainUpsellContainer.className = 'wpcom-domain-upsell-callout';
			document.body.appendChild( domainUpsellContainer );
			render( <DomainUpsellCallout />, domainUpsellContainer );
		}
	}
}

showDomainUpsellCallout();
