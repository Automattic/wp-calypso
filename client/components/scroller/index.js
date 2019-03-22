import classNames from 'classnames';
import ReactDOM from 'react-dom';
import React from 'react';
import PropTypes from 'prop-types';

const EPSILON = 0.00001;

class Scroller extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			initializing: true,
			scrollLeft: 0,
			scrollPaneWidth: 3 * 200,
			startAt: null,
		};
	}

	componentDidMount() {
		this.recalculate();
		this.debouncedHandleResize = _.throttle( this.handleResize, 400 );
		window.addEventListener( 'resize', this.debouncedHandleResize, false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.debouncedHandleResize );
	}

	handleResize = () => {
		this.recalculate();
	};

	render() {
		const { initializing, scrollPaneWidth, scrollLeft } = this.state;
		return (
			<div className="scroller">
				{ this.getLeftOverlay() }
				<div
					className={ classNames( 'scroller__scroll-pane', { initializing } ) }
					style={ { width: scrollPaneWidth } }
					ref="scrollPane"
				>
					<div
						className="scroller__scrolled-pane"
						style={ { left: scrollLeft } }
						ref="scrolledPane"
					>
						{ this.props.children }
					</div>
				</div>
				{ this.getRightOverlay() }
			</div>
		);
	}

	getLeftOverlay() {
		return (
			<div
				className="scroller__left-nav"
				style={ { width: `calc( (100% - ${ this.state.scrollPaneWidth }px) / 2 )` } }
				onClick={ () => this.scrollLeft() }
				onKeyPress={ this.handleKeyPress.bind( this ) }
				role="button"
				tabIndex={ -1 }
			>
				<svg
					width="28px"
					height="28px"
					viewBox="0 0 28 28"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g stroke="none" fill="none" fillRule="evenodd">
						<circle id="Oval" fill="#3D4145" cx="14" cy="14" r="14" />
						<polygon
							id="Mask"
							fill="#FFFFFF"
							fillRule="nonzero"
							points="22 13 9.83 13 15.42 7.41 14 6 6 14 14 22 15.41 20.59 9.83 15 22 15"
						/>
					</g>
				</svg>
			</div>
		);
	}

	getRightOverlay() {
		return (
			<div
				className="scroller__right-nav"
				style={ { width: `calc( (100% - ${ this.state.scrollPaneWidth }px) / 2 )` } }
				onClick={ () => this.scrollRight() }
				onKeyPress={ this.handleKeyPress.bind( this ) }
				role="button"
				tabIndex={ 0 }
			>
				<svg
					width="28px"
					height="28px"
					viewBox="0 0 28 28"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g stroke="none" fill="none" fillRule="evenodd" transform="rotate(180,14,14)">
						<circle id="Oval" fill="#3D4145" cx="14" cy="14" r="14" />
						<polygon
							id="Mask"
							fill="#FFFFFF"
							fillRule="nonzero"
							points="22 13 9.83 13 15.42 7.41 14 6 6 14 14 22 15.41 20.59 9.83 15 22 15"
						/>
					</g>
				</svg>
			</div>
		);
	}

	recalculate() {
		const currentNode = ReactDOM.findDOMNode( this );
		const scrolledElements = this.findScrolledElements();
		const nbElements = scrolledElements.length;

		if ( nbElements === 0 ) {
			return;
		}

		const UI_WIDTH = 60;
		const availableSpace = currentNode.offsetWidth;
		const gutterWidth = this.props.getRightGutterSizeForElement( 0 );
		const contentWidth = this.refs.scrolledPane.offsetWidth;
		const elementWidth = scrolledElements[ 0 ].offsetWidth;
		const nbActiveElements = Math.max(
			1,
			Math.min(
				Math.floor(
					( availableSpace - UI_WIDTH + gutterWidth ) / ( elementWidth + gutterWidth ) + EPSILON
				),
				nbElements
			)
		);
		const startAt = Math.floor( ( nbElements - nbActiveElements ) / 2 + EPSILON );
		const scrollPaneWidth =
			nbActiveElements * elementWidth + ( nbActiveElements - 1 ) * gutterWidth;

		new Promise( resolve =>
			this.setState(
				{
					contentWidth,
					elementWidth,
					scrollPaneWidth,
					startAt,
					initializing: false,
					nbActiveElements: nbActiveElements,
				},
				resolve
			)
		)
			.then( () => {
				this.applyActiveElementsClassNames();
				this.moveScrollToFirstActiveElement();
			} );
	}

	moveScrollToFirstActiveElement() {
		const { startAt } = this.state;
		const scrolledElements = this.findScrolledElements();
		const scrollPaneRect = this.refs.scrollPane.getBoundingClientRect();
		const firstActiveRect = scrolledElements[ startAt ].getBoundingClientRect();
		const scrollLeftDelta = scrollPaneRect.left - firstActiveRect.left;
		console.log( 'moveScrollToFirstActiveElement', scrollPaneRect.left, firstActiveRect.left );
		this.setState( {
			scrollLeft: this.state.scrollLeft + scrollLeftDelta,
		} );
	}

	fixScrollPositionAfterResize() {
		const { startAt } = this.state;
	}

	scrollLeft() {
		this.scrollBy( -1 );
	}

	scrollRight() {
		this.scrollBy( 1 );
	}

	scrollBy( offset ) {
		this.scrollTo( this.state.startAt + offset );
	}

	scrollTo( newStartAt ) {
		const prevStartAt = this.state.startAt;
		if ( prevStartAt === newStartAt || ! this.canScrollTo( newStartAt ) ) {
			return;
		}

		const direction = newStartAt - prevStartAt > 0 ? 1 : -1;
		const scrolledElements = this.findScrolledElements();
		const scrollLeftDelta =
			scrolledElements[ prevStartAt ].offsetLeft -
			scrolledElements[ prevStartAt + direction ].offsetLeft;

		this.setState(
			{
				startAt: newStartAt,
				scrollLeft: this.state.scrollLeft + scrollLeftDelta,
			},
			() => this.applyActiveElementsClassNames()
		);
	}

	canScrollTo( index ) {
		const { nbActiveElements } = this.state;
		return this.isIndexValid( index ) && this.isIndexValid( index + nbActiveElements - 1 );
	}

	isIndexValid( index ) {
		const scrolledElements = this.findScrolledElements();
		return index >= 0 && index < scrolledElements.length;
	}

	isElementActive( index ) {
		const { startAt, nbActiveElements } = this.state;
		return index >= startAt && index < startAt + nbActiveElements;
	}

	findScrolledElements() {
		const { elementSelector } = this.props;
		const currentNode = ReactDOM.findDOMNode( this );
		return currentNode.querySelectorAll( elementSelector );
	}

	applyActiveElementsClassNames() {
		const scrolledElements = this.findScrolledElements();
		for ( let i = 0, max = scrolledElements.length; i < max; i++ ) {
			this.props.setElementActive( i, this.isElementActive( i ) );
		}
	}

	handleKeyPress( event ) {
		// if ( event.key === 'Enter' || event.key === ' ' ) {
		// 	event.preventDefault();
		// 	this.move( 'left' );
		// }
	}
}

Scroller.propTypes = {
	elementSelector: PropTypes.string,
	initialPosition: PropTypes.number,
	setElementActive: PropTypes.func,
};

export default Scroller;