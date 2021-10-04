import { localize } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';

function PodcastingNotSupportedMessage( { translate } ) {
	return (
		<div className="podcasting-details__not-supported">
			<EmptyContent
				illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
				title={ translate( 'Management of podcast settings are not supported on this site.' ) }
			/>
		</div>
	);
}

export default localize( PodcastingNotSupportedMessage );
