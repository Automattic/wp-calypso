/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import UpgradeNudge from 'my-sites/upgrade-nudge';

export default React.createClass( {

	displayName: 'UpgradeNudge',

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/upgrade-nudge">Upgrade Nudges</a>
				</h2>
				<div>
					<UpgradeNudge
						feature="custom-domain"
						href="#"
					/>
				</div>
				<div>
					<UpgradeNudge
						title="This is a title"
						message="This is a custom message"
						icon="customize"
						compact
					/>
				</div>
			</div>
		);
	}
} );
