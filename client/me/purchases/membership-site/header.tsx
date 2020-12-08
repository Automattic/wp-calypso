/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

export default function MembershipSiteHeader( {
	name,
	domain,
}: {
	name: string;
	domain: string;
} ): JSX.Element {
	return (
		<CompactCard className="membership-site__header">
			<div className="membership-site__icon">
				<Gridicon icon="globe" />
			</div>
			<div className="membership-site__info">
				<div className="membership-site__title">{ name }</div>
				<div className="membership-site__domain">{ domain }</div>
			</div>
		</CompactCard>
	);
}
