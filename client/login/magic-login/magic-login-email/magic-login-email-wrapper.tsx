import { recordTracksEvent } from '@automattic/calypso-analytics';
import { extractDomainWithExtension } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { MagicLoginEmail } from '.';
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

export function MagicLoginEmailWrapper( { emailAddress }: MagicLoginEmailWrapperProps ) {
	const logEvent = ( domain: string ) => {
		recordTracksEvent( 'calypso_magic_login_email_click', { domain } );
	};

	const filteredDomains = getEmailDomain( emailAddress );

	if ( filteredDomains?.length > 0 ) {
		return (
			<ul>
				{ filteredDomains.map( ( item: MagicEmailDomainInfo, key: number ) => (
					<li key={ key }>
						<Button
							variant="secondary"
							href={ item.url }
							target="_blank"
							rel="noreferrer noopener"
							onClick={ () => logEvent( item.name ) }
						>
							<MagicLoginEmail.Icon icon={ item.name.toLocaleLowerCase() } />
							<MagicLoginEmail.Content mailProviderName={ item.name } />
						</Button>
					</li>
				) ) }
			</ul>
		);
	}
}
