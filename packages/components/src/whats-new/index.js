/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Guide, GuidePage } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import wpcom from 'wpcom';
import proxyRequest from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import './style.scss';

const WhatsNewGuide = () => {
	const [ isLoaded, setIsLoaded ] = useState( false );
	const [ showGuide, setShowGuide ] = useState( true );
	const [ whatsNewData, setWhatsNewData ] = useState();

	// Load What's New list on first site load
	useEffect( () => {
		const proxiedWpcom = wpcom();
		proxiedWpcom.request = proxyRequest;
		proxiedWpcom.req
			.get( { path: '/whats-new/list', apiNamespace: 'wpcom/v2' } )
			.then( ( returnedList ) => {
				setWhatsNewData( returnedList );
				setIsLoaded( true );
			} );
	}, [] );

	const toggleWhatsNew = () => setShowGuide( false );

	return (
		<>
			{ isLoaded && showGuide && (
				<Guide
					className="whats-new"
					contentLabel={ __( "What's New at WordPress.com", 'full-site-editing' ) }
					finishButtonText={ __( 'Close', 'full-site-editing' ) }
					onFinish={ toggleWhatsNew }
				>
					{ whatsNewData.announcements.map( ( page, index ) => (
						<WhatsNewPage
							key={ page.announcementId }
							pageNumber={ index + 1 }
							isLastPage={ index === whatsNewData.announcements.length - 1 }
							{ ...page }
						/>
					) ) }
				</Guide>
			) }
		</>
	);
};

function WhatsNewPage( {
	pageNumber,
	isLastPage,
	alignBottom = false,
	heading,
	description,
	imgSrc,
	link,
} ) {
	useEffect( () => {
		recordTracksEvent( 'calypso_block_editor_whats_new_slide_view', {
			slide_number: pageNumber,
			is_last_slide: isLastPage,
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
	return (
		<GuidePage className="whats-new__page">
			<div className="whats-new__text">
				<h1 className="whats-new__heading">{ heading }</h1>
				<div className="whats-new__description">
					<p>{ description }</p>
					{ link && (
						<p>
							<a href={ link } target="_blank" rel="noreferrer">
								Learn more
							</a>
						</p>
					) }
				</div>
			</div>
			<div className="whats-new__visual">
				<img
					// Force remount so the stale image doesn't remain while new image is fetched
					key={ imgSrc }
					src={ imgSrc }
					alt={ description }
					aria-hidden="true"
					className={ 'whats-new__image' + ( alignBottom ? ' align-bottom' : '' ) }
				/>
			</div>
		</GuidePage>
	);
}
export default WhatsNewGuide;
