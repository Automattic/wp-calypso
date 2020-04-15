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
import {
	withAnalytics,
	composeAnalytics,
	recordTracksEvent,
	bumpStat,
} from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import freePhotoLibraryVideoPrompt from 'assets/images/customer-home/illustration--free-photo-library.svg';

const FreePhotoLibrary = ( { openSupportArticleDialogAndTrack } ) => {
	const translate = useTranslate();

	return (
		<Card className="free-photo-library">
			{ isDesktop() && (
				<button onClick={ openSupportArticleDialogAndTrack.bind( this, 'prompt' ) }>
					<img
						className="free-photo-library__demonstration-image"
						src={ freePhotoLibraryVideoPrompt }
						alt={ translate( 'Free Photo Library demonstration' ) }
					/>
				</button>
			) }
			<CardHeading>{ translate( 'Over 40,000 Free Photos' ) }</CardHeading>
			<p className="free-photo-library__text customer-home__card-subheader">
				{ translate(
					'The WordPress.com Free Photo Library integrates ' +
						'your site with beautiful copyright-free photos to ' +
						'create stunning designs.'
				) }
			</p>
			<Button onClick={ openSupportArticleDialogAndTrack.bind( this, 'button' ) }>
				{ translate( 'Learn more' ) }
			</Button>
		</Card>
	);
};

const openSupportArticleDialogAndTrack = clickSource =>
	withAnalytics(
		composeAnalytics(
			clickSource === 'prompt'
				? recordTracksEvent( 'calypso_customer_home_free_photo_library_video_dialog_view' )
				: recordTracksEvent( 'calypso_customer_home_free_photo_library_video_support_page_view' ),
			clickSource === 'prompt'
				? bumpStat( 'calypso_customer_home', 'view_free_photo_library_video' )
				: bumpStat( 'calypso_customer_home', 'view_free_photo_library_learn_more' )
		),
		openSupportArticleDialog( {
			postId: 145498,
			postUrl: localizeUrl( 'https://wordpress.com/support/free-photo-library/' ),
		} )
	);

export default connect( null, { openSupportArticleDialogAndTrack } )( FreePhotoLibrary );
