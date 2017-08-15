/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';

/**
 * Module vars
 */
const noop = function() {};

export default class extends React.PureComponent {
    static displayName = 'Headers';

	render() {
		return (
			<div>
				<HeaderCake onClick={ noop }>
					Subsection Header aka Header Cake
				</HeaderCake>
				<p>Clicking header cake returns to previous section.</p>
				<HeaderCake onClick={ noop } actionIcon="status" actionText="Action" actionOnClick={ () => { alert( 'i <3 cake' ) } }>
					Header Cake with optional Action Button
				</HeaderCake>
			</div>
		);
	}
}
