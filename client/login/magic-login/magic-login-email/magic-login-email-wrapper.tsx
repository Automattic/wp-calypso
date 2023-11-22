import { MagicLoginEmail } from '.';
import './style.scss';

interface MagicEmailDomainInfo {
	domain: string;
	name: string;
	iconElement: string;
	url: string;
}
interface MagicLoginEmailWrapperProps {
	emailAddress: string;
}
const knownDomains: MagicEmailDomainInfo[] = [
	{ domain: 'apple.com', name: 'Apple', iconElement: 'AppleIcon', url: 'https://www.icloud.com' },
	{ domain: 'gmail.com', name: 'Gmail', iconElement: 'GmailIcon', url: 'https://mail.google.com' },
	{
		domain: 'outlook.com',
		name: 'Outlook',
		iconElement: 'OutlookIcon',
		url: 'https://outlook.live.com',
	},
	{ domain: 'yahoo.com', name: 'Yahoo', iconElement: 'YahooIcon', url: 'https://mail.yahoo.com' },
	{ domain: 'aol.com', name: 'AOL', iconElement: 'AOLIcon', url: 'https://mail.aol.com' },
];

export function MagicLoginEmailWrapper( { emailAddress }: MagicLoginEmailWrapperProps ) {
	const getEmailDomain = ( email: string ): MagicEmailDomainInfo[] => {
		const domainMatch = email.match( /@(.+)$/ );
		const domain = domainMatch ? domainMatch[ 1 ].toLowerCase() : null;

		const filteredDomains = knownDomains.filter( ( e ) => e.domain.toLowerCase() === domain );

		return filteredDomains.length > 0 ? filteredDomains : knownDomains;
	};

	const userDomainEmail = getEmailDomain( emailAddress );

	return (
		userDomainEmail && (
			<ul>
				{ userDomainEmail.map( ( item: MagicEmailDomainInfo, key: number ) => (
					<li key={ key }>
						<a target="_blank" href={ item.url } rel="noreferrer">
							<MagicLoginEmail.Icon icon={ item.iconElement } />
							<MagicLoginEmail.Content name={ item.name } />
						</a>
					</li>
				) ) }
			</ul>
		)
	);
}
