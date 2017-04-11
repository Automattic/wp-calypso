/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import throttle from 'lodash/throttle';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import viewport from 'lib/viewport';

class StickyPanel extends Component {
	static propTypes = {
		className: PropTypes.string,
		offset: PropTypes.number,
		stickyTo: PropTypes.string,
	};

	static defaultProps = {
		offset: 10,
		stickyTo: 'header',
	}

	state = { isSticky: false };

	componentDidMount() {
		if ( viewport.isMobile() ) {
			return null;
		}

		this.throttleOnResize = throttle( this.onWindowResize, 200 );
		window.addEventListener( 'scroll', this.onWindowScroll );
		window.addEventListener( 'resize', this.throttleOnResize );

		this.stickyDomElement = ReactDom.findDOMNode( this );

		this.computeHeightFakeElement();
		this.updateIsSticky();
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.onWindowScroll );
		window.removeEventListener( 'resize', this.throttleOnResize );
		window.cancelAnimationFrame( this.rafHandle );
	}

	onWindowScroll = () => {
		this.rafHandle = window.requestAnimationFrame( this.updateIsSticky );
	};

	onWindowResize = () => {
		this.computeHeightFakeElement();
		this.updateIsSticky();
	};

	computeHeightFakeElement() {
		this.fakeElementHeigth = this.stickyDomElement.offsetHeight;

		// be dure that a child element exists
		if ( ! (
			this.stickyDomElement.children &&
			this.stickyDomElement.children[ 0 ] &&
			this.stickyDomElement.children[ 0 ].children &&
			this.stickyDomElement.children[ 0 ].children[ 0 ]
		) ) {
			return null;
		}

		// adjust fake element height considering margins of the wrapper element to stick
		this.childDomElement = this.stickyDomElement.children[ 0 ].children[ 0 ];
		const childStyles = this.childDomElement.currentStyle || window.getComputedStyle( this.childDomElement );
		this.fakeElementHeigth += parseInt( childStyles.marginTop ) + parseInt( childStyles.marginBottom );
	}

	updateIsSticky = () => {
		if ( viewport.isMobile() ) {
			return this.setState( { isSticky: false } );
		}

		let threshold = this.stickyDomElement.offsetTop;
		this.stickAt = this.props.offset;

		if ( this.props.stickyTo ) {
			const elementToStick = document.getElementById( this.props.stickyTo );

			if ( elementToStick ) {
				this.stickAt += elementToStick.offsetTop + elementToStick.offsetHeight;
			}
		}

		threshold -= this.stickAt;

		this.setState( { isSticky: window.pageYOffset > threshold } );
	};

	setPositionByStyles() {
		if ( ! this.state.isSticky ) {
			return null;
		}

		return {
			top: this.stickAt,
			width: this.stickyDomElement.offsetWidth,
		};
	}

	showFakePanelByStyles() {
		if ( ! this.state.isSticky ) {
			return null;
		}

		return {
			height: this.fakeElementHeigth,
		};
	}

	render() {
		const classes = classNames(
			'sticky-panel',
			this.props.className,
			{ 'is-sticky': this.state.isSticky }
		);

		return (
			<div className={ classes }>
				<div className="sticky-panel__content" style={ this.setPositionByStyles() }>
					{ this.props.children }
				</div>
				<div className="sticky-panel__fake" style={ this.showFakePanelByStyles() } />
			</div>
		);
	}
}

export default StickyPanel;

