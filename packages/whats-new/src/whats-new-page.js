/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { recordTracksEvent } from '@automattic/calypso-analytics';
// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
import { Button, GuidePage, __experimentalText as Text } from '@wordpress/components';
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
		recordTracksEvent( 'wpcom_whats_new_slide_view', {
			slide_number: pageNumber,
			is_last_slide: isLastPage,
		} );
	}, [ isLastPage, pageNumber ] );

	return (
		<GuidePage className="whats-new-page__container">
			<div className="whats-new-page__text">
				{ heading && <Text variant="title.large">{ heading }</Text> }
				<div className="whats-new-page__description">
					{ description && <Text variant="body">{ description }</Text> }
					{ link && (
						<Button
							className="whats-new-page__link"
							href={ link }
							isTertiary
							isLink
							target="_blank"
						>
							{ __( 'Learn more' ) }
						</Button>
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
