import { SiteDetails } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { stringify } from 'qs';
import { useDispatch } from 'react-redux';
import { useDomainOwnerUserName } from 'calypso/components/data/query-domain-owner-username';
import PromoCard from 'calypso/components/promo-section/promo-card';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

type EmailNonDomainOwnerMessageProps = {
	domain?: ResponseDomain;
	selectedSite?: SiteDetails | null;
	usePromoCard: boolean;
	source: 'email-comparison' | 'email-management';
};

export const EmailNonDomainOwnerMessage = ( props: EmailNonDomainOwnerMessageProps ) => {
	const { domain, selectedSite, source, usePromoCard } = props;

	const translate = useTranslate();
	const dispatch = useDispatch();

	const ownerUserName = useDomainOwnerUserName( selectedSite, domain );

	const isPrivacyAvailable = domain?.privacyAvailable;

	const buildQueryString = ( parameters = {} ) =>
		parameters ? stringify( parameters, { addQueryPrefix: true, skipNulls: true } ) : '';

	const buildLoginUrl = () => {
		const redirectUrlParameter = encodeURIComponent(
			emailManagementPurchaseNewEmailAccount(
				selectedSite?.slug ?? '',
				domain?.name ?? '',
				null,
				'login-redirect'
			)
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

	const onClickLink = ( eventType: 'owner_contact' | 'user_login' | 'contact_support' ) => {
		const properties = {
			owner_login: ownerUserName,
		};

		if ( eventType === 'owner_contact' ) {
			dispatch( recordTracksEvent( `calypso_email_providers_owner_contact_click`, properties ) );

			return;
		} else if ( eventType === 'contact_support' ) {
			dispatch( recordTracksEvent( `calypso_email_providers_contact_support_click`, properties ) );

			return;
		}

		dispatch( recordTracksEvent( `calypso_email_providers_user_login_click`, properties ) );
	};

	const translateOptions = {
		components: {
			loginLink: (
				<a
					rel="noopener noreferrer"
					href={ loginUrl }
					onClick={ () => onClickLink( 'user_login' ) }
				/>
			),
			reachOutLink: isPrivacyAvailable ? (
				<a
					href={ contactOwnerUrl }
					onClick={ () => onClickLink( 'owner_contact' ) }
					rel="noopener noreferrer"
					target="_blank"
				/>
			) : (
				<></>
			),
			contactSupportLink: (
				<a
					href="https://wordpress.com/help/contact"
					onClick={ () => onClickLink( 'contact_support' ) }
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

	function getReason() {
		switch ( source ) {
			case 'email-comparison':
				return translate(
					'Email service can only be purchased by {{reachOutLink}}%(ownerUserName)s{{/reachOutLink}}, ' +
						'who is the owner of %(selectedDomainName)s. ' +
						'If you have access to that account, please {{loginLink}}log in with the account{{/loginLink}} to make a purchase. ' +
						'Otherwise, please reach out to {{reachOutLink}}%(ownerUserName)s{{/reachOutLink}} or {{contactSupportLink}}contact support{{/contactSupportLink}}',
					translateOptions
				);
			case 'email-management':
				return translate(
					'Additional mailboxes can only be purchased by {{reachOutLink}}%(ownerUserName)s{{/reachOutLink}}, ' +
						'who is the owner of %(selectedDomainName)s. ' +
						'If you have access to that account, please {{loginLink}}log in with the account{{/loginLink}} to make a purchase. ' +
						'Otherwise, please reach out to {{reachOutLink}}%(ownerUserName)s{{/reachOutLink}} or {{contactSupportLink}}contact support{{/contactSupportLink}}',
					translateOptions
				);
			default:
				return null;
		}
	}

	if ( usePromoCard ) {
		return (
			<PromoCard className="email-non-domain-owner-message__non-owner-notice">
				<p>{ getReason() }</p>
			</PromoCard>
		);
	}

	return <p className="email-non-domain-owner-message__non-owner-message">{ getReason() }</p>;
};
