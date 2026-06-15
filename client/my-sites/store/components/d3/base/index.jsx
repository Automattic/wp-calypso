import clsx from 'clsx';
import { select as d3Select } from 'd3-selection';
import PropTypes from 'prop-types';
import { Component } from 'react';

export default class D3Base extends Component {
	static propTypes = {
		className: PropTypes.string,
		drawChart: PropTypes.func.isRequired,
		getParams: PropTypes.func.isRequired,
	};

	componentDidMount() {
		window.addEventListener( 'resize', this.draw );
	}

	componentDidUpdate() {
		this.draw();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.draw );
		delete this.node;
	}

	draw() {
		if ( this.node ) {
			this.props.drawChart( this.createNewContext(), this.props.getParams( this.node ) );
		}
	}

	createNewContext() {
		const { className } = this.props;
		const { width, height } = this.props.getParams( this.node );

		d3Select( this.node ).selectAll( 'svg' ).remove();
		const newNode = d3Select( this.node )
			.append( 'svg' )
			.attr( 'class', `${ className }__viewbox` )
			.attr( 'viewBox', `0 0 ${ width } ${ height }` )
			.attr( 'preserveAspectRatio', 'xMidYMid meet' )
			.append( 'g' );
		return newNode;
	}

	setNodeRef = ( node ) => {
		this.node = node;
	};

	render() {
		return <div className={ clsx( 'd3-base', this.props.className ) } ref={ this.setNodeRef } />;
	}
}
