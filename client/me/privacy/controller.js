import React from 'react';
import PrivacyComponent from 'calypso/me/privacy/main';

export function privacy( context, next ) {
	context.primary = React.createElement( PrivacyComponent );
	next();
}
