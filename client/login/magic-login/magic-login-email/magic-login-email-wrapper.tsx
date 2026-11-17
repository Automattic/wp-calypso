import { recordTracksEvent } from '@automattic/calypso-analytics';
import { extractDomainWithExtension } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { MagicLoginEmail } from '.';

import '@automattic/components/styles/wp-button-override.scss';
import 'calypso/components/social-buttons/style.scss';
import './style.scss';

interface MagicEmailDomainInfo {
	domain: string;
	name: string;
	url: string;
}
interface MagicLoginEmailWrapperProps {
	emailAddress: string;
}
const knownDomains: MagicEmailDomainInfo[] = [
	{ domain: 'apple.com', name: 'Apple', url: 'https://www.icloud.com' },
	{ domain: 'gmail.com', name: 'Gmail', url: 'https://mail.google.com' },
	{
		domain: 'outlook.com',
		name: 'Outlook',
		url: 'https://outlook.live.com',
	},
	{ domain: 'yahoo.com', name: 'Yahoo', url: 'https://mail.yahoo.com' },
	{ domain: 'aol.com', name: 'AOL', url: 'https://mail.aol.com' },
];

const getEmailDomain = ( email: string ): MagicEmailDomainInfo[] => {
	const domainMatch = extractDomainWithExtension( email );
	return knownDomains.filter( ( e ) => e.domain.toLowerCase() === domainMatch );
};

const logEvent = ( domain: string ) => {
	recordTracksEvent( 'calypso_magic_login_email_click', { domain } );
};

/**
 * The "Open in Gmail" link as a button, styled like the login page's social buttons.
 */
export function MagicLoginEmailButton( { emailAddress }: MagicLoginEmailWrapperProps ) {
	const translate = useTranslate();

	return getEmailDomain( emailAddress ).map( ( item ) => (
		<Button
			key={ item.domain }
			className="a8c-components-wp-button social-buttons__button"
			variant="secondary"
			__next40pxDefaultSize
			href={ item.url }
			target="_blank"
			rel="noreferrer noopener"
			onClick={ () => logEvent( item.name ) }
		>
			<MagicLoginEmail.Icon
				icon={ item.name.toLocaleLowerCase() }
				// Holds the icon's 20px slot, which the label's offset assumes, so it doesn't
				// shift when the icon arrives.
				placeholder={ <svg width="20" height="20" aria-hidden="true" /> }
			/>
			<span className="social-buttons__service-name">
				{ translate( 'Open in %(mailProviderName)s', { args: { mailProviderName: item.name } } ) }
			</span>
		</Button>
	) );
}

export function MagicLoginEmailWrapper( { emailAddress }: MagicLoginEmailWrapperProps ) {
	const filteredDomains = getEmailDomain( emailAddress );

	if ( filteredDomains?.length > 0 ) {
		return (
			<ul>
				{ filteredDomains.map( ( item: MagicEmailDomainInfo, key: number ) => (
					<li key={ key }>
						<a
							onClick={ () => logEvent( item.name ) }
							target="_blank"
							href={ item.url }
							rel="noreferrer noopener"
						>
							<MagicLoginEmail.Icon icon={ item.name.toLocaleLowerCase() } />
							<MagicLoginEmail.Content mailProviderName={ item.name } />
						</a>
					</li>
				) ) }
			</ul>
		);
	}
}
