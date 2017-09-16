/**
* External dependencies
*/
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Reactions from 'components/reactions';

export default class ReactionsExample extends PureComponent {
	state = {};

	onSelected = ( icon, slug ) => {
		this.setState( {
			icon,
			slug,
		} );
	}

	render() {
		return (
			<div>
				<Reactions
					onSelected={ this.onSelected }
				/>
				<hr />
				Icon: { this.state.icon }<br />
				Slug: { this.state.slug }
			</div>
		);
	}
}
