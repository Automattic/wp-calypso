import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import SectionHeader from 'calypso/components/section-header';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import Stream from 'calypso/reader/stream';
import FollowingIntro from './intro';
import './style.scss';

function FollowingStream( { ...props } ) {
	const translate = useTranslate();

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Stream { ...props }>
			<FollowingIntro />
			<SectionHeader label={ translate( 'Followed Sites' ) }>
				<Button primary compact className="following__manage" href="/following/manage">
					{ translate( 'Manage' ) }
				</Button>
			</SectionHeader>
		</Stream>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default SuggestionProvider( FollowingStream );
