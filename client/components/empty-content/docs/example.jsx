/** @format */
/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';

const EmptyContentExample = () => {
	const primaryAction = (
		<a className="empty-content__action button is-primary" href="/">
			Primary action
		</a>
	);
	const secondaryAction = (
		<a className="empty-content__action button" href="/discover">
			Secondary action
		</a>
	);
	return (
		<div className="design-assets__group">
			<div>
				<EmptyContent
					title="Title"
					line="Subtitle"
					action={ primaryAction }
					secondaryAction={ secondaryAction }
					illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
					illustrationWidth={ 400 }
				/>
			</div>
		</div>
	);
};

EmptyContentExample.displayName = 'EmptyContent';

export default EmptyContentExample;
