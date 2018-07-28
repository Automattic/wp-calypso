/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { Draggable, Dashicon, Panel, PanelBody } from '@wordpress/components';

Draggable.displayName = 'Draggable';

export default class extends React.Component {
	static displayName = 'Draggable';

	static defaultProps = {
		exampleCode: (
			<div id="draggable-panel">
				<Panel header="Draggable panel" >
					<PanelBody>
						<Draggable
							elementId="draggable-panel"
							transferData={ { } }
						>
							<Dashicon icon="move" />
						</Draggable>
					</PanelBody>
				</Panel>
			</div>
		),
	};

	render() {
		return this.props.exampleCode;
	}
}
