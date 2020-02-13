/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal Dependencies
 */
import LogItem from './components/log-item';

class ScanPage extends Component {
	render() {
		return (
			<div>
				<p>This is the Jetpack Scan landing page! { this.props.siteId } site</p>
				<LogItem
					header="Unexpected core file: sx--a4bp.php"
					subheader="Threat found on 14 September, 2019"
				>
					<h3>Item Header</h3>
					<p>Foo</p>
					<h3>Item Header 2</h3>
					<p>Bar</p>
				</LogItem>
				<LogItem
					header="Unexpected core file: sx--a4bp.php"
					subheader="Threat found on 14 September, 2019"
					tag="critical"
					highlight="error"
				>
					Hello
				</LogItem>
			</div>
		);
	}
}

export default ScanPage;
