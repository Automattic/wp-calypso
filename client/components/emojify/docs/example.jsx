/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Emojify from 'components/emojify';

export default class EmojifyExample extends React.Component {
	static displayName = 'EmojifyExample';

	render() {
		const textToEmojify = 'This 🙈 will be converted 🙉🙊🙂';
		return (
			<div className="design-assets__group">
				<Emojify>{ textToEmojify }</Emojify>
			</div>
		);
	}
};
