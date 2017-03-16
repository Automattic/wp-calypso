
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
					value="Use this input element to change the top position of the sticky element below changing its height."
					onChange={ noop }
				/>


				<StickyPanelComponent className="docs__sticky-panel-example">
					<Card>
						<div style={ { marginBottom: '20px', marginTop: '10px' } }>
							<textarea
								value="Let's stick this textarea. Play changing its height."
								onChange={ noop }
							/>
						</div>
					</Card>
				</StickyPanelComponent>

				<div className="docs__sticky-panel-scrolling-box" />
			</div>
		);
	}
}

export default StickyPanel;
