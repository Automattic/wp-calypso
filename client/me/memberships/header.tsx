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
		<CompactCard className="memberships__header">
			<div className="memberships__icon">
				<Gridicon icon="globe" />
			</div>
			<div className="memberships__info">
				<div className="memberships__title">{ name }</div>
				<div className="memberships__domain">{ domain }</div>
			</div>
		</CompactCard>
	);
}
