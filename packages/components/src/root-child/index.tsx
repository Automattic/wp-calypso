/**
 * External dependencies
 */
import React from 'react';
import ReactDOM from 'react-dom';

type State = { containerEl: HTMLDivElement | null };

export default class RootChild extends React.Component< void, State > {
	// we can render the children only after the container DOM element has been created and added
	// to the DOM tree. And we can't create and append the element in component constructor because
	// there is no corresponding destructor that would safely remove it in case the render is not
	// committed by React.
	//
	// A seemingly possible approach is to create the element in constructor, render the portal into
	// it and then add it to `document.body` in `componentDidMount`. But that creates another subtle
	// bug: the portal is rendered into a DOM element that's not part of the DOM tree and therefore
	// is not part of layout and painting, and has no dimensions. Many component's lifecycles and
	// effect hooks rightfully assume that the element can be measured in `componentDidMount` or
	// `useEffect`.
	//
	// Another thing that fails inside a detached DOM element is accessing `iframe.contentWindow`.
	// The `contentWindow` is `null` until the `iframe` becomes active, i.e., is added to the DOM
	// tree. We access the `contentWindow` in `WebPreview`, for example.
	state: State = {
		containerEl: null,
	};

	componentDidMount(): void {
		// create the container element and immediately trigger a rerender
		const containerEl = document.createElement( 'div' );
		document.body.appendChild( containerEl );
		this.setState( { containerEl } ); // eslint-disable-line react/no-did-mount-set-state
	}

	componentWillUnmount(): void {
		if ( this.state.containerEl ) {
			document.body.removeChild( this.state.containerEl );
		}
	}

	render(): JSX.Element | null {
		// don't render anything until the `containerEl` is created. That's the correct behavior
		// in SSR (no portals there, `RootChild` renders as empty).
		if ( ! this.state.containerEl ) {
			return null;
		}

		return ReactDOM.createPortal( this.props.children, this.state.containerEl );
	}
}
