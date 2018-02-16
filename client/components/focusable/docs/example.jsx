/** @format */

/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'gridicons';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import config from 'config';
import DocsExample from 'devdocs/docs-example';
import Focusable from 'components/focusable';
import ScreenReaderText from 'components/screen-reader-text';

class FocusableExample extends React.PureComponent {
	static displayName = 'Focusable';

	render() {
		return config.isEnabled( 'devdocs/components-usage-stats' )
			? this.renderDocsExampleWithUsageStats()
			: this.renderFocusable();
	}

	renderDocsExampleWithUsageStats = () => {
		return (
			<DocsExample componentUsageStats={ this.props.componentUsageStats }>
				{ this.renderFocusable() }
			</DocsExample>
		);
	};

	renderFocusable = () => {
		return (
			<Card>
				<Focusable onClick={ noop }>
					<p>
						This keyboard-accessible component can contain other elements as children, including{' '}
						<code>p</code>s, <code>div</code>s, or other components.
					</p>
				</Focusable>
				<p>
					An example of real use is in the Language Picker, which can be considered a "complex
					button."
				</p>
				<Focusable onClick={ noop } className="language-picker">
					<div className="language-picker__icon" aria-hidden>
						<div className="language-picker__icon-inner">en</div>
					</div>
					<div className="language-picker__name">
						<div className="language-picker__name-inner">
							<div className="language-picker__name-label">English</div>
							<div className="language-picker__name-change">Change</div>
						</div>
					</div>
				</Focusable>
			</Card>
		);
	};
}

export default FocusableExample;
