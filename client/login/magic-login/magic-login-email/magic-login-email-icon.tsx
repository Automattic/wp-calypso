import AOLIcon from 'calypso/components/social-icons/aol';
import AppleIcon from 'calypso/components/social-icons/apple';
import GmailIcon from 'calypso/components/social-icons/gmail';
import OutlookIcon from 'calypso/components/social-icons/outlook';
import YahooIcon from 'calypso/components/social-icons/yahoo';

interface MagicLoginEmailIconProps {
	icon: string;
}
export function MagicLoginEmailIcon( { icon }: MagicLoginEmailIconProps ) {
	switch ( icon ) {
		case 'GmailIcon':
			return <GmailIcon />;
		case 'AppleIcon':
			return <AppleIcon />;
		case 'AOLIcon':
			return <AOLIcon />;
		case 'OutlookIcon':
			return <OutlookIcon />;
		case 'YahooIcon':
			return <YahooIcon />;
		default:
			return null;
	}
}
