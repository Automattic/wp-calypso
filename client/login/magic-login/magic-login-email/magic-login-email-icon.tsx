import AsyncLoad from 'calypso/components/async-load';

interface MagicLoginEmailIconProps {
	icon: string;
}

export function MagicLoginEmailIcon( { icon }: MagicLoginEmailIconProps ) {
	switch ( icon ) {
		case 'apple':
			return <AsyncLoad require="calypso/components/social-icons/apple" placeholder={ null } />;
		case 'gmail':
			return <AsyncLoad require="calypso/components/social-icons/gmail" placeholder={ null } />;
		case 'outlook':
			return <AsyncLoad require="calypso/components/social-icons/outlook" placeholder={ null } />;
		case 'yahoo':
			return <AsyncLoad require="calypso/components/social-icons/yahoo" placeholder={ null } />;
		case 'aol':
			return <AsyncLoad require="calypso/components/social-icons/aol" placeholder={ null } />;
		default:
			return null;
	}
}
