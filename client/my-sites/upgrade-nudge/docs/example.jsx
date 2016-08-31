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
			<div>
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
