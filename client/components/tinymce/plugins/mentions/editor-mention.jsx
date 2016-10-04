/**
 * External dependencies
 */
import React from 'react';

export default class EditorMention extends React.Component {
	static propTypes = {
		username: React.PropTypes.string
	};

	render() {
		const { username } = this.props;

		return (
			<span>
				@{ username }
			</span>
		);
	}
}
