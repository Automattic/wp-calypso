
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import StickyPanelComponent from 'components/sticky-panel';

class StickyPanel extends PureComponent {
	render() {
		return (
			<div>
				<textarea
					value="Use this input element to change be able to scroll the page changing its height."
					onChange={ noop }
				/>


				<StickyPanelComponent className="docs__sticky-panel-example">
					<Card>
						<div>Let's stick this content.</div>
					</Card>
				</StickyPanelComponent>

				<textarea
					value="Use this input element to change be able to scroll the page changing its height."
					onChange={ noop }
				/>
			</div>
		);
	}
}

export default StickyPanel;
