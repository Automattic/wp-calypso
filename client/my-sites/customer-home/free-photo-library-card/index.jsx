/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { Button, Card } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import { openSupportArticleDialog } from 'state/inline-support-article/actions';
import { localizeUrl } from 'lib/i18n-utils';
import { withAnalytics, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';

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
	openSupportArticleDialogAndTrack,
} ) => {
	const translate = useTranslate();

	const displayDialog = () => {
		tracks( 'calypso_customer_home_free_photo_library_video_support_page_view' );
		supportArticleDialog( {
			postId: 145498,
			postUrl: localizeUrl( 'https://support.wordpress.com/free-photo-library/' ),
		} );
	};

	return (
		<Card className="free-photo-library-card">
			{ isDesktop() && (
				<button onClick={ displayDialog }>
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
			<Button onClick={ openSupportArticleDialogAndTrack }>{ translate( 'Learn more' ) }</Button>
		</Card>
	);
};

const openSupportArticleDialogAndTrack = () =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_free_photo_library_video_support_page_view' )
		),
		openSupportArticleDialog( {
			postId: 145498,
			postUrl: localizeUrl( 'https://support.wordpress.com/free-photo-library/' ),
		} )
	);

export default connect( null, { openSupportArticleDialogAndTrack, recordTracksEvent } )(
	FreePhotoLibraryCard
);
