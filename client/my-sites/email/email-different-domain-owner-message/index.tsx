import { useTranslate } from 'i18n-calypso';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

type EmailDifferentDomainOwnerMessageProps = {
	source: string;
};

export const EmailDifferentDomainOwnerMessage = (
	props: EmailDifferentDomainOwnerMessageProps
) => {
	const { source } = props;

	const translate = useTranslate();

	const onClickLink = ( eventType: 'login' | 'support' ) => {
		const properties = {
			action: eventType,
			source,
		};

		recordTracksEvent( `calypso_email_providers_nonowner_click`, properties );
	};

	const translateOptions = {
		components: {
			contactSupportLink: (
				<a
					href="https://wordpress.com/help/contact"
					onClick={ () => onClickLink( 'support' ) }
					rel="noopener noreferrer"
					target="_blank"
				/>
			),
		},
	};

	return (
		<>
			<TrackComponentView
				eventName="calypso_email_providers_nonowner_impression"
				eventProperties={ { source } }
			/>
			<p className="email-non-owner-message__non-owner-message">
				{ translate(
					'Additional mailboxes can only be purchased by the owner of the domain and email subscriptions. ' +
						'Please {{contactSupportLink}}contact support{{/contactSupportLink}} to make a purchase.',
					translateOptions
				) }
			</p>
		</>
	);
};
