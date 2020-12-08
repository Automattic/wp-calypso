/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import SectionHeader from 'calypso/components/section-header';
import GSuiteUserItem from 'calypso/my-sites/email/email-management/gsuite-user-item';

/**
 * Style dependencies
 */
import './style.scss';

const Placeholder = () => (
	<div className="gsuite-users-card__container is-placeholder">
		<SectionHeader label={ 'G Suite Users' } />
		<CompactCard className="gsuite-users-card__user-list">
			<ul className="gsuite-users-card__user-list-inner">
				<GSuiteUserItem user={ { email: 'mail@example.com', domain: 'example.com' } } />
			</ul>
		</CompactCard>
	</div>
);

export default Placeholder;
