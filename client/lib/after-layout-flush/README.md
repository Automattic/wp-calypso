# `afterLayoutFlush`

This module exports a function that creates a wrapper to invoke a function as soon as possible
after the next layout flush.At that time, it is very unlikely that the DOM has been written to
since the last layout and it should be safe to read from DOM without causing a synchronous reflow,
i.e., cheaply and without any performance hit.

Inspired by a MDN article about [Firefox performance best practices](https://developer.mozilla.org/en-US/Firefox/Performance_best_practices_for_Firefox_fe_engineers)

## Usage

Very useful to read from up-to-date DOM after a React component is updated:

```js
class NavTabs extends Component {
	state = {
		isDropdown: false,
	};

	setDropdown = () => {
		// measure the rendered elements to determine style. Reads from DOM (!)
		const isDropdown = this.containerEl.offsetWidth < this.tabsEl.offsetWidth;
		if ( this.state.isDropdown !== isDropdown ) {
			this.setState( { isDropDown } );
		}
	};

	// postpone reading from DOM after all DOM writes are done and layout is flushed
	setDropdownAfterLayout = afterLayoutFlush( this.setDropdown );

	componentDidMount() {
		// check the rendered element sizes after mount, but wait until after layout
		this.setDropdownAfterLayout();
	}

	componentDidUpdate() {
		// check the rendered element sizes after update, but wait until after layout
		this.setDropdownAfterLayout();
	}

	componentWillUnmount() {
		// cancel the `setDropdown` calls that are potentially scheduled to be executed.
		// Prevents calling the method on an already unmounted component.
		this.setDropdownAfterLayout.cancel();
	}

	render() {
		// render inner element with a className that depends on `state.isDropdown`
		return (
			<div ref={ ( el ) => ( this.containerEl = el ) }>
				<div
					className={ this.state.isDropdown ? 'dropdown' : 'tabs' }
					ref={ ( el ) => ( this.tabsEl = el ) }
				>
					{ this.props.children }
				</div>
			</div>
		);
	}
}
```
