import config from '@automattic/calypso-config';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';

export const Subscribers = () => {
	const isSubscribersPageEnabled = config.isEnabled( 'subscribers-page' );

	if ( ! isSubscribersPageEnabled ) {
		return null;
	}

	return (
		<Main className="subscribers">
			<DocumentHead title="Subscribers" />
			<FormattedHeader
				brandFont
				className="subscribers__page-heading"
				headerText="Subscribers page"
				subHeaderText="Test"
				align="left"
			/>
		</Main>
	);
};
