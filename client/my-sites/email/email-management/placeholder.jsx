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
import GSuiteUserItem from 'my-sites/email/gsuite-user-item';

const Placeholder = () => (
	<div className="email-management__placeholder">
		<SectionHeader label={ 'G Suite Users' } />
		<CompactCard className="email-management__google-apps-users-card-user-list">
			<ul className="email-management__google-apps-users-card-user-list-inner">
				<GSuiteUserItem user={ { email: 'mail@example.com', domain: 'example.com' } } />
			</ul>
		</CompactCard>
	</div>
);

export default Placeholder;
