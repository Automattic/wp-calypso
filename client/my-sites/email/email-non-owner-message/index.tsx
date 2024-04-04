import { SiteDetails } from '@automattic/data-stores';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { stringify } from 'qs';
import { useEmailOwnerUserName } from 'calypso/components/data/query-email-owner-username';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';

import './style.scss';

type EmailNonOwnerMessageProps = {
	domainName: string;
	selectedSite?: SiteDetails | null;
	source: string;
};

const buildQueryString = ( parameters = {} ) =>
	parameters ? stringify( parameters, { addQueryPrefix: true, skipNulls: true } ) : '';

export const EmailNonOwnerMessage = ( props: EmailNonOwnerMessageProps ) => {
	const { domainName, selectedSite, source } = props;

	const translate = useTranslate();

	const ownerUserName = useEmailOwnerUserName( selectedSite, domainName );

	const buildLoginUrl = () => {
		const redirectUrlParameter = getEmailManagementPath( selectedSite?.slug, domainName );

		return `/log-in/${ buildQueryString( {
			email_address: ownerUserName,
			redirect_to: redirectUrlParameter,
		} ) }`;
	};

	const loginUrl = buildLoginUrl();

	const onClickLink = ( eventType: 'login' | 'support' ) => {
		const properties = {
			action: eventType,
			source,
			context: 'email-different-owner',
		};

		recordTracksEvent( `calypso_email_providers_nonowner_click`, properties );
	};

	const translateOptions = {
		components: {
			contactSupportLink: (
				<a
					href={ CALYPSO_CONTACT }
					onClick={ () => onClickLink( 'support' ) }
					rel="noopener noreferrer"
					target="_blank"
				/>
			),
			loginLink: <a href={ loginUrl } onClick={ () => onClickLink( 'login' ) } rel="external" />,
			strong: <strong />,
		},
		args: {
			ownerUserName,
			selectedDomainName: domainName,
		},
	};

	let reasonText: TranslateResult | null;

	if ( ownerUserName ) {
		reasonText = translate(
			'Additional mailboxes can only be purchased by {{strong}}%(ownerUserName)s{{/strong}}, ' +
				'who is the owner of the email subscription. ' +
				'If you have access to that account, please {{loginLink}}log in with the account{{/loginLink}} to make a purchase. ' +
				'Otherwise, please reach out to {{strong}}%(ownerUserName)s{{/strong}} or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
			translateOptions
		);
	} else {
		reasonText = translate(
			'Additional mailboxes can only be purchased by the owner of the email subscription. ' +
				'If you have access to that account, please log in with the account to make a purchase. ' +
				'Otherwise, please {{contactSupportLink}}contact support{{/contactSupportLink}}.',
			translateOptions
		);
	}

	return (
		<>
			<TrackComponentView
				eventName="calypso_email_providers_nonowner_impression"
				eventProperties={ { source, context: 'email-different-owner' } }
			/>
			<p className="email-non-owner-message__text">{ reasonText }</p>
		</>
	);
};
