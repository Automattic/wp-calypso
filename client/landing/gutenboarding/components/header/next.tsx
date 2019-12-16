/**
 * External dependencies
 */
import React, { FunctionComponent, ComponentPropsWithoutRef } from 'react';
import { __ as NO__ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Link from '../link';

type Props = Pick< ComponentPropsWithoutRef< typeof Link >, 'to' >;
const Next: FunctionComponent< Props > = ( { to } ) => (
	// eslint-disable-next-line wpcalypso/jsx-classname-namespace
	<Link to={ to } className="gutenboarding__header-next-button" isPrimary isLarge>
		{ NO__( 'Next' ) }
	</Link>
);
export default Next;
