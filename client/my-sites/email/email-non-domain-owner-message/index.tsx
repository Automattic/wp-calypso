import { SiteDetails } from '@automattic/data-stores';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { stringify } from 'qs';
import { useDomainOwnerUserName } from 'calypso/components/data/query-domain-owner-username';
import PromoCard from 'calypso/components/promo-section/promo-card';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';

import './style.scss';

type EmailNonDomainOwnerMessageProps = {
	domain?: ResponseDomain;
	selectedSite?: SiteDetails | null;
	source: 'email-comparison' | 'email-management';
	usePromoCard: boolean;
};

const buildQueryString = ( parameters = {} ) =>
	parameters ? stringify( parameters, { addQueryPrefix: true, skipNulls: true } ) : '';

export const EmailNonDomainOwnerMessage = ( props: EmailNonDomainOwnerMessageProps ) => {
	const { domain, selectedSite, source, usePromoCard } = props;

	const translate = useTranslate();

	const ownerUserName = useDomainOwnerUserName( selectedSite, domain );

	const isPrivacyAvailable = domain?.privacyAvailable;

	const buildLoginUrl = () => {
		const redirectUrlParameter = emailManagementPurchaseNewEmailAccount(
			selectedSite?.slug ?? '',
			domain?.name ?? '',
			null,
			'login-redirect'
		);

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
		};

		recordTracksEvent( `calypso_email_providers_nonowner_click`, properties );
	};

	const translateOptions = {
		components: {
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
			contactSupportLink: (
				<a
					href="https://wordpress.com/help/contact"
					onClick={ () => onClickLink( 'support' ) }
					rel="noopener noreferrer"
					target="_blank"
				/>
			),
		},
		args: {
			ownerUserName,
			selectedDomainName: domain?.name,
		},
	};

	let reasonText: TranslateResult | null = null;

	if ( source === 'email-comparison' ) {
		if ( ownerUserName ) {
			reasonText = translate(
				'Email service can only be purchased by {{reachOutLink}}%(ownerUserName)s{{/reachOutLink}}, ' +
					'who is the owner of %(selectedDomainName)s. ' +
					'If you have access to that account, please {{loginLink}}log in with the account{{/loginLink}} to make a purchase. ' +
					'Otherwise, please {{reachOutLink}}reach out to %(ownerUserName)s{{/reachOutLink}} or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
				translateOptions
			);
		} else {
			reasonText = translate(
				'Email service can only be purchased by the owner of %(selectedDomainName)s. ' +
					'If you have access to that account, please log in with the account to make a purchase. ' +
					'Otherwise, please {{contactSupportLink}}contact support{{/contactSupportLink}}.',
				translateOptions
			);
		}
	} else if ( source === 'email-management' ) {
		if ( ownerUserName ) {
			reasonText = translate(
				'Additional mailboxes can only be purchased by {{reachOutLink}}%(ownerUserName)s{{/reachOutLink}}, ' +
					'who is the owner of %(selectedDomainName)s. ' +
					'If you have access to that account, please {{loginLink}}log in with the account{{/loginLink}} to make a purchase. ' +
					'Otherwise, please reach out to {{reachOutLink}}%(ownerUserName)s{{/reachOutLink}} or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
				translateOptions
			);
		} else {
			reasonText = translate(
				'Additional mailboxes can only be purchased by the owner of %(selectedDomainName)s. ' +
					'If you have access to that account, please log in with the account to make a purchase. ' +
					'Otherwise, please {{contactSupportLink}}contact support{{/contactSupportLink}}.',
				translateOptions
			);
		}
	}

	if ( usePromoCard ) {
		return (
			<PromoCard className="email-non-domain-owner-message__non-owner-notice">
				<p>{ reasonText }</p>
			</PromoCard>
		);
	}

	return <p className="email-non-domain-owner-message__non-owner-message">{ reasonText }</p>;
};
