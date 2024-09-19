import { CALYPSO_CONTACT } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export const EmailDifferentDomainOwnerMessage = () => {
	const translate = useTranslate();

	const recordClickEvent = () => {
		const properties = {
			action: 'support',
			source: 'email-management',
		};

		recordTracksEvent( `calypso_email_providers_nonowner_click`, properties );
	};

	const translateOptions = {
		components: {
			contactSupportLink: (
				<a
					href={ CALYPSO_CONTACT }
					onClick={ () => recordClickEvent() }
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
				eventProperties={ { source: 'email-management', context: 'different-owners' } }
			/>
			<p className="email-non-domain-owner-message__text">
				{ translate(
					'Additional mailboxes can only be purchased by the owner of the domain and email subscriptions. ' +
						'Please {{contactSupportLink}}contact support{{/contactSupportLink}} to make a purchase.',
					translateOptions
				) }
			</p>
		</>
	);
};
