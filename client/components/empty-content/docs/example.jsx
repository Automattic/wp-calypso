/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';

const EmptyContentExample = ( props ) => {
	return props.exampleCode;
};

EmptyContentExample.displayName = 'EmptyContent';

EmptyContentExample.defaultProps = {
	exampleCode: (
		<div className="design-assets__group">
			<div>
				<EmptyContent
					title="Title"
					line="Subtitle"
					action={
						<a className="empty-content__action button is-primary" href="/">
							Primary action
						</a>
					}
					secondaryAction={
						<a className="empty-content__action button" href="/discover">
							Secondary action
						</a>
					}
					illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
					illustrationWidth={ 400 }
				/>
			</div>
		</div>
	),
};

export default EmptyContentExample;
