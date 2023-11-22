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
							<MagicLoginEmail.Icon icon={ item.name.toLocaleLowerCase() } />
							<MagicLoginEmail.Content name={ item.name } />
						</a>
					</li>
				) ) }
			</ul>
		)
	);
}
