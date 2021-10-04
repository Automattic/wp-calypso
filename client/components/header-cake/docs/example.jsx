import { Button } from '@automattic/components';
import { PureComponent } from 'react';
import HeaderCake from 'calypso/components/header-cake';

/**
 * Module vars
 */
const noop = function () {};

const action = () => alert( 'i <3 cake' );

export default class extends PureComponent {
	static displayName = 'Headers';

	render() {
		return (
			<div>
				<HeaderCake onClick={ noop }>Subsection Header aka Header Cake</HeaderCake>
				<p>Clicking header cake returns to previous section.</p>
				<HeaderCake
					onClick={ noop }
					actionIcon="status"
					actionText="Action"
					actionOnClick={ action }
				>
					Header Cake with optional Action Button
				</HeaderCake>
				<HeaderCake
					onClick={ noop }
					actionButton={
						<Button compact primary onClick={ action }>
							An action
						</Button>
					}
				>
					Header Cake with a custom action button
				</HeaderCake>
			</div>
		);
	}
}
