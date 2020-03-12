/**
 * External dependencies
 */
import React, { Fragment, useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import { Button, Card, Dialog } from '@automattic/components';
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
import freePhotoLibraryVideoPrompt from 'assets/images/customer-home/free-photo-library-video-prompt.png';

const FreePhotoLibraryCard = () => {
	const [ showDialog, setShowDialog ] = useState( false );
	const translate = useTranslate();

	const toggleDialog = () => setShowDialog( ! showDialog );

	return (
		<Fragment>
			<Dialog additionalClassNames="free-photo-library-card__dialog" isVisible={ showDialog }>
				<div className="free-photo-library-card__demonstration-video">
					<iframe
						title="Photo Library"
						width="100%"
						height="100%"
						className="free-photo-library-card__video-frame"
						src="https://videopress.com/embed/k5Td6RTn"
						frameBorder="0"
						allowFullScreen={ true }
					/>
				</div>
				<div className="free-photo-library-card__dialog-close">
					<Button onClick={ toggleDialog }>{ translate( 'Close' ) }</Button>
				</div>
			</Dialog>
			<Card className="free-photo-library-card">
				{ isDesktop() && (
					<button onClick={ toggleDialog }>
						<img
							className="free-photo-library-card__demonstration-image"
							src={ freePhotoLibraryVideoPrompt }
							alt={ translate( 'Free Photo Library demonstration' ) }
						/>
					</button>
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
		</Fragment>
	);
};

export default FreePhotoLibraryCard;
