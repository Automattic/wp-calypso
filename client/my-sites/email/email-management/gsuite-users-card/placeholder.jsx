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
import GSuiteUserItem from 'my-sites/email/email-management/gsuite-user-item';

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
