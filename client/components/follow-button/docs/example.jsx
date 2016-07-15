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

const FollowButtons = React.createClass( {
	displayName: 'FollowButtons',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-component/follow-buttons">Follow Button</a>
				</h2>
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

export default FollowButtons;
