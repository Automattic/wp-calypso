/**
 * External dependencies
 */
import React, { FunctionComponent, ComponentPropsWithoutRef } from 'react';
import { __ as NO__ } from '@wordpress/i18n';
import { Icon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Link from '../link';

type Props = Pick< ComponentPropsWithoutRef< typeof Link >, 'to' >;
const Prev: FunctionComponent< Props > = ( { to } ) => (
	// eslint-disable-next-line wpcalypso/jsx-classname-namespace
	<Link className="gutenboarding__header-back-button" to={ to }>
		<Icon icon="arrow-left-alt" />
		{ NO__( 'Back' ) }
	</Link>
);
export default Prev;
