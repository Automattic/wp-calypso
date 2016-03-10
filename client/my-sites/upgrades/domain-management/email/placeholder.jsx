/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import SectionHeader from 'components/section-header';
import GoogleAppsUserItem from './google-apps-user-item';

const Placeholder = () =>
	<div className="is-placeholder">
		<SectionHeader
			label={ 'Google Apps Users' } />
		<CompactCard className="google-apps-users-card">
			<ul className="google-apps-users-card__user-list">
				<GoogleAppsUserItem user={ { email: 'mail@example.com', domain: 'example.com' } } />
			</ul>
		</CompactCard>
	</div>
;

export default Placeholder;
