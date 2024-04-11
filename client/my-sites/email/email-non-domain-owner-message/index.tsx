import { SiteDetails } from '@automattic/data-stores';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { stringify } from 'qs';
import { useDomainOwnerUserName } from 'calypso/components/data/query-domain-owner-username';
import PromoCard from 'calypso/components/promo-section/promo-card';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ResponseDomain } from 'calypso/lib/domains/types';
import {
	getEmailManagementPath,
	getPurchaseNewEmailAccountPath,
} from 'calypso/my-sites/email/paths';

import './style.scss';

type EmailNonDomainOwnerMessageProps = {
	domain?: ResponseDomain;
	selectedSite?: SiteDetails | null;
	source: 'email-comparison' | 'email-management';
	usePromoCard?: boolean;
};

const buildQueryString = ( parameters = {} ) =>
	parameters ? stringify( parameters, { addQueryPrefix: true, skipNulls: true } ) : '';

export const EmailNonDomainOwnerMessage = ( props: EmailNonDomainOwnerMessageProps ) => {
	const { domain, selectedSite, source, usePromoCard = true } = props;

	const translate = useTranslate();

	const ownerUserName = useDomainOwnerUserName( selectedSite, domain );

	const isPrivacyAvailable = domain?.privacyAvailable;
	const buildLoginUrl = () => {
		const redirectUrlParameter =
			source === 'email-comparison'
				? getPurchaseNewEmailAccountPath( selectedSite?.slug, domain?.name, '', 'login-redirect' )
				: getEmailManagementPath( selectedSite?.slug, domain?.name );

		return `/log-in/${ buildQueryString( {
			email_address: ownerUserName,
			redirect_to: redirectUrlParameter,
		} ) }`;
	};

	const contactOwnerUrl = `https://privatewho.is/${ buildQueryString( {
		s: domain?.name,
	} ) }`;

	const loginUrl = buildLoginUrl();

	const onClickLink = ( eventType: 'contact' | 'login' | 'support' ) => {
		const properties = {
			action: eventType,
			source,
			context: 'domain-different-owner',
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
			reachOutLink: isPrivacyAvailable ? (
				<a
					href={ contactOwnerUrl }
					onClick={ () => onClickLink( 'contact' ) }
					rel="noopener noreferrer"
					target="_blank"
				/>
			) : (
				<></>
			),
			strong: <strong />,
		},
		args: {
			ownerUserName,
			selectedDomainName: domain?.name ?? '',
		},
	};

	let reasonText: TranslateResult | null;

	if ( ownerUserName ) {
		reasonText = translate(
			'Email service can only be purchased by {{strong}}%(ownerUserName)s{{/strong}}, ' +
				'who is the owner of {{strong}}%(selectedDomainName)s{{/strong}}. ' +
				'If you have access to that account, please {{loginLink}}log in with the account{{/loginLink}} to make a purchase. ' +
				'Otherwise, please {{reachOutLink}}reach out to %(ownerUserName)s{{/reachOutLink}} or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
			translateOptions
		);
	} else {
		reasonText = translate(
			'Email service can only be purchased by the owner of {{strong}}%(selectedDomainName)s{{/strong}}. ' +
				'If you have access to that account, please log in with the account to make a purchase. ' +
				'Otherwise, please {{contactSupportLink}}contact support{{/contactSupportLink}}.',
			translateOptions
		);
	}

	return (
		<>
			{ usePromoCard ? (
				<PromoCard className="email-non-domain-owner-message__promo-card">
					<p>{ reasonText }</p>
				</PromoCard>
			) : (
				<p className="email-non-domain-owner-message__text">{ reasonText }</p>
			) }
			<TrackComponentView
				eventName="calypso_email_providers_nonowner_impression"
				eventProperties={ { source, context: 'domain-different-owner' } }
			/>
		</>
	);
};
