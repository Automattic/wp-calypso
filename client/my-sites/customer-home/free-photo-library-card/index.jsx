/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { Card, Button } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import freePhotoLibraryThumbnail from 'assets/images/customer-home/free-photo-library-thumbnail.png';

export const FreePhotoLibraryCard = ( { translate } ) => {
	return (
		<Card className="free-photo-library-card">
			{ isDesktop() && (
				<video
					className="free-photo-library-card__demonstration"
					controls
					muted
					preload="none"
					poster={ freePhotoLibraryThumbnail }
				>
					<source
						src="https://wpcom.files.wordpress.com/2020/02/free-photo-library-demonstration.mp4"
						type="video/mp4"
					/>
				</video>
			) }
			<CardHeading>{ translate( 'Over 40,000 Free Photos' ) }</CardHeading>
			<p className="free-photo-library-card__text customer-home__card-subheader">
				{ translate(
					'The WordPress.com Free Photo Library integrates ' +
						'your site with beautiful copyright-free photos to ' +
						'create stunning designs.'
				) }
			</p>
			<Button href={ localizeUrl( 'https://support.wordpress.com/free-photo-library/' ) }>
				{ translate( 'Learn more' ) }
			</Button>
		</Card>
	);
};

export default localize( FreePhotoLibraryCard );
