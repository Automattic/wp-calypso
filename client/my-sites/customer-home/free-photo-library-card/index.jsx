/**
 * External dependencies
 */
import React, { Fragment, useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import { Button, Card, Dialog } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { openSupportArticleDialog } from 'state/inline-support-article/actions';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import freePhotoLibraryVideoPrompt from 'assets/images/customer-home/free-photo-library-video-prompt.png';

const FreePhotoLibraryCard = ( {
	recordTracksEvent: tracks,
	openSupportArticleDialog: supportArticleDialog,
} ) => {
	const [ showDialog, setShowDialog ] = useState( false );
	const translate = useTranslate();

	const toggleDialog = () => {
		if ( ! showDialog ) {
			tracks( 'calypso_customer_home_free_photo_library_video_dialog_view' );
		}
		return setShowDialog( ! showDialog );
	};

	const openSupportAndTrack = () => {
		withAnalytics(
			recordTracksEvent( 'calypso_customer_home_free_photo_library_video_support_page_view' ),
			supportArticleDialog( {
				postId: 145498,
				postUrl: 'https://support.wordpress.com/free-photo-library/',
			} )
		);
	};

	return (
		<Fragment>
			<Dialog additionalClassNames="free-photo-library-card__dialog" isVisible={ showDialog }>
				<div className="free-photo-library-card__demonstration-video">
					<iframe
						title={ translate( 'Free Photo Library demonstration' ) }
						width="560"
						height="315"
						src="https://www.youtube.com/embed/RHG_yfd1SVw?rel=0&autoplay=1"
						frameBorder="0"
						allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
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
				<Button onClick={ openSupportAndTrack }>{ translate( 'Learn more' ) }</Button>
			</Card>
		</Fragment>
	);
};

export default connect( null, { openSupportArticleDialog, recordTracksEvent } )(
	FreePhotoLibraryCard
);
