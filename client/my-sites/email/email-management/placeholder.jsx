/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import SectionHeader from 'components/section-header';
import GSuiteUserItem from './gsuite-user-item';

const Placeholder = () => (
	<div className="email-management__gsuite-users-card is-placeholder">
		<SectionHeader label={ 'G Suite Users' } />
		<CompactCard className="email-management__gsuite-card-user-list">
			<ul className="email-management__gsuite-users-card-user-list-inner">
				<GSuiteUserItem user={ { email: 'mail@example.com', domain: 'example.com' } } />
			</ul>
		</CompactCard>
	</div>
);

export default Placeholder;
