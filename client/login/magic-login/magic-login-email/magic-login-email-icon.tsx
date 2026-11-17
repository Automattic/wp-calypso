import { type ReactNode } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import AppleIcon from 'calypso/components/social-icons/apple';

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
	/**
	 * Shown while the provider's icon loads.
	 */
	placeholder?: ReactNode;
}

export function MagicLoginEmailIcon( { icon, placeholder = null }: MagicLoginEmailIconProps ) {
	switch ( icon ) {
		case 'apple':
			// No async import because AppleIcon is already in the login bundle via
			// social-buttons/apple, so AsyncLoad cannot split it.
			return <AppleIcon />;
		case 'gmail':
			return <AsyncLoad require={ loadGmail } placeholder={ placeholder } />;
		case 'outlook':
			return <AsyncLoad require={ loadOutlook } placeholder={ placeholder } />;
		case 'yahoo':
			return <AsyncLoad require={ loadYahoo } placeholder={ placeholder } />;
		case 'aol':
			return <AsyncLoad require={ loadAol } placeholder={ placeholder } />;
		default:
			return null;
	}
}
