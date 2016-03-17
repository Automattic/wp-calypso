/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';

export default class ResizableView extends PureComponent {
	constructor( props ) {
		super( props );

		this.boundSetWrapperState = this.setWrapperState.bind( this );
		this.state = {
			wrapper: null
		};
	}

	setWrapperState( wrapper ) {
		if ( ! wrapper ) {
			return;
		}

		this.setState( { wrapper } );
		this.disconnectObserver();
		this.observer = new MutationObserver( this.props.onResize );
		this.observer.observe( wrapper, {
			attributes: true,
			childList: true,
			subtree: true
		} );
	}

	componentWillUnmount() {
		this.disconnectObserver();
	}

	disconnectObserver() {
		if ( this.observer ) {
			this.observer.disconnect();
		}
	}

	render() {
		let children;
		if ( this.state.wrapper ) {
			children = React.cloneElement( this.props.children, {
				width: this.state.wrapper.clientWidth
			} );
		}

		return (
			<div ref={ this.boundSetWrapperState } { ...this.props }>
				{ children }
			</div>
		);
	}
}

ResizableView.propTypes = {
	onResize: PropTypes.func
};

ResizableView.defaultProps = {
	onResize: () => {}
};
