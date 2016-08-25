/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import UpgradeNudge from 'my-sites/upgrade-nudge';
import ExpandedUpgradeNudge from 'my-sites/upgrade-nudge/expanded';
import {
	PLAN_BUSINESS, FEATURE_ADVANCED_SEO
} from 'lib/plans/constants';

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
				<div>
					<ExpandedUpgradeNudge
						plan={ PLAN_BUSINESS }
						upgrade={ () => alert( 'Props for upgrading!' ) }
						title={ this.translate( 'Title' ) }
						subtitle={ this.translate( 'Subtitle' ) }
						highlightedFeature={ FEATURE_ADVANCED_SEO }
						event={ 'example' }
						benefits={ [
							'First benefit',
							'Second benefit',
							'Third benefit'
						] }
					/>
				</div>
			</div>
		);
	}
} );
