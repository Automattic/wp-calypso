import AsyncLoad from 'calypso/components/async-load';

const loadApple = () =>
	import(
		/* webpackChunkName: "async-load-calypso-components-social-icons-apple" */ 'calypso/components/social-icons/apple'
	);
const loadGmail = () =>
	import(
		/* webpackChunkName: "async-load-calypso-components-social-icons-gmail" */ 'calypso/components/social-icons/gmail'
	);
const loadOutlook = () =>
	import(
		/* webpackChunkName: "async-load-calypso-components-social-icons-outlook" */ 'calypso/components/social-icons/outlook'
	);
const loadYahoo = () =>
	import(
		/* webpackChunkName: "async-load-calypso-components-social-icons-yahoo" */ 'calypso/components/social-icons/yahoo'
	);
const loadAol = () =>
	import(
		/* webpackChunkName: "async-load-calypso-components-social-icons-aol" */ 'calypso/components/social-icons/aol'
	);

interface MagicLoginEmailIconProps {
	icon: string;
}

export function MagicLoginEmailIcon( { icon }: MagicLoginEmailIconProps ) {
	switch ( icon ) {
		case 'apple':
			return <AsyncLoad require={ loadApple } placeholder={ null } />;
		case 'gmail':
			return <AsyncLoad require={ loadGmail } placeholder={ null } />;
		case 'outlook':
			return <AsyncLoad require={ loadOutlook } placeholder={ null } />;
		case 'yahoo':
			return <AsyncLoad require={ loadYahoo } placeholder={ null } />;
		case 'aol':
			return <AsyncLoad require={ loadAol } placeholder={ null } />;
		default:
			return null;
	}
}
