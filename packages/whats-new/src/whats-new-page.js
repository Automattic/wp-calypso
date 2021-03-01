/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { GuidePage } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';

function WhatsNewPage( {
	alignBottom = false,
	description,
	heading,
	imageSrc,
	isLastPage,
	key,
	link,
	pageNumber,
} ) {
	const __ = useI18n().__;

	useEffect( () => {
		recordTracksEvent( 'calypso_block_editor_whats_new_slide_view', {
			slide_number: pageNumber,
			is_last_slide: isLastPage,
		} );
	}, [ isLastPage, pageNumber ] );

	return (
		<GuidePage className="whats-new-page__container">
			<div className="whats-new-page__text">
				{ heading && <h1 className="whats-new-page__heading">{ heading }</h1> }
				<div className="whats-new-page__description">
					{ description && <p>{ description }</p> }
					{ link && (
						<p>
							<a href={ link } target="_blank" rel="noreferrer">
								{ __( 'Learn more' ) }
							</a>
						</p>
					) }
				</div>
			</div>
			<div className="whats-new-page__visual">
				{ imageSrc && (
					<img
						key={ key }
						src={ imageSrc }
						alt={ description }
						aria-hidden="true"
						className={ 'whats-new-page__image' + ( alignBottom ? ' align-bottom' : '' ) }
					/>
				) }
			</div>
		</GuidePage>
	);
}

export default WhatsNewPage;
