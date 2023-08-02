import { __ } from '@wordpress/i18n';
import classNames from 'classnames';
import AsyncLoad from 'calypso/components/async-load';
import FormattedHeader from 'calypso/components/formatted-header';
import withDimensions from 'calypso/lib/with-dimensions';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import Stream, { WIDE_DISPLAY_CUTOFF } from 'calypso/reader/stream';
import ReaderListFollowedSites from 'calypso/reader/stream/reader-list-followed-sites';
import FollowingIntro from './intro';
import './style.scss';

function FollowingStream( { ...props } ) {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<>
			<FormattedHeader
				brandFont
				headerText={ __( 'Recent' ) }
				subHeaderText={ __( "Stay current with the blogs you've subscribed to." ) }
				align="left"
				hasScreenOptions
				className={ classNames( 'following-stream-header', {
					'reader-dual-column': props.width > WIDE_DISPLAY_CUTOFF,
				} ) }
			/>
			<Stream
				{ ...props }
				className="following"
				streamSidebar={ () => <ReaderListFollowedSites path={ window.location.pathname } /> }
			>
				<FollowingIntro />
			</Stream>
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default SuggestionProvider( withDimensions( FollowingStream ) );
