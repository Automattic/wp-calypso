import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { getTld } from 'calypso/lib/domains';

export function getUnsupportedDomainTransferMessage( domain ) {
	return createInterpolateElement(
		sprintf(
			/* translators: %s - the TLD extension of the domain the user wanted to transfer (ex.: com, net, org, etc.) */
			__( "We don't support transfers of <strong>.%s</strong> domains to WordPress.com" ),
			getTld( domain )
		),
		{ strong: createElement( 'strong' ) }
	);
}
