/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import FoldableCard from 'calypso/components/foldable-card';
import GSuiteUserItem from 'calypso/my-sites/email/email-management/gsuite-user-item';

/**
 * Style dependencies
 */
import './style.scss';

const Placeholder = () => {
	const header = (
		<>
			<span className="gsuite-users-card__foldable-card-header-icon" />

			<span className="gsuite-users-card__foldable-card-header-text">
				<strong />
				<em />
			</span>
		</>
	);

	return (
		<div className="gsuite-users-card is-placeholder">
			<div>
				<FoldableCard className="gsuite-users-card__foldable-card" header={ header }>
					<ul />
				</FoldableCard>

				<CompactCard className="gsuite-users-card__user-list">
					<ul className="gsuite-users-card__user-list-inner">
						<GSuiteUserItem user={ { email: 'mail@example.com', domain: 'example.com' } } />
					</ul>
				</CompactCard>
			</div>
		</div>
	);
};

export default Placeholder;
