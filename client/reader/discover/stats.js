import { recordAction, recordGaEvent, recordTrack } from 'calypso/reader/stats';

export function recordAuthorClick( author ) {
	recordGaEvent( 'Clicked Discover Card Attribution Author' );
	recordAction( 'discover_card_author_clicked' );
	recordTrack( 'calypso_reader_author_on_discover_card_clicked', { author_url: author } );
}

export function recordFollowToggle( isFollowing, siteUrl ) {
	recordAction( 'discover_card_following_clicked' );

	if ( isFollowing ) {
		recordGaEvent( 'Clicked Follow Discover Site' );
		recordAction( 'discover_card_site_followed' );
		recordTrack( 'calypso_reader_discover_site_followed', { site_url: siteUrl } );
	} else {
		recordGaEvent( 'Clicked Unfollow Discover Site' );
		recordAction( 'discover_card_site_unfollowed' );
		recordTrack( 'calypso_reader_discover_site_unfollowed', { site_url: siteUrl } );
	}
}
