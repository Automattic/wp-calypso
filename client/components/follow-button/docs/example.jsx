/**
* External dependencies
*/
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import FollowButton from 'components/follow-button/button';
import Card from 'components/card/compact';

export default React.createClass( {
	displayName: 'FollowButton',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<div>
				<Card compact>
					<FollowButton following={ false } />
				</Card>
				<Card compact>
					<FollowButton following={ true } />
				</Card>
				<Card compact>
					<FollowButton disabled={ true } />
				</Card>
			</div>
		);
	}
} );
