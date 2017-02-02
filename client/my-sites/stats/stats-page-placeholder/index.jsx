/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const StatsPagePlaceholder = (
	<div className="main is-wide-layout">
		<Card className="stats-module stats-page-placeholder__header is-loading">
			<div className="module-header">
				<h3 className="module-header-title" />
			</div>
		</Card>
		<Card className="stats-module stats-page-placeholder__content is-loading">
			<div className="module-header">
				<h3 className="module-header-title" />
			</div>
		</Card>
	</div>
);

export default () => StatsPagePlaceholder;
