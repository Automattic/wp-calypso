/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import DocsExample from 'calypso/devdocs/docs-example';
import Focusable from 'calypso/components/focusable';

export default class FocusableExample extends React.PureComponent {
	static displayName = 'Focusable';

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<DocsExample>
				<Focusable onClick={ noop }>
					<p>
						This keyboard-accessible component can contain other elements as children, including{ ' ' }
						<code>p</code>
						s, <code>div</code>
						s, or other components.
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
			</DocsExample>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}
