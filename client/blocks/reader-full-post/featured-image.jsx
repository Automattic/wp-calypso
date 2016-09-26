/**
* External dependencies
*/
import React from 'react';

export default class FeaturedImage extends React.Component {
	constructor() {
		super();
		this.state = { src: '' };
	}

	componentDidMount() {
		const img = new Image();
		img.onload = () => this.setState( { src: this.props.src } );
		img.src = this.props.src;
	}

	render() {
		if ( ! this.state.src ) {
			return null;
		}

		return (
			<div className="reader-full-post__featured-image">
				<img src={ this.state.src } />
			</div>
		);
	}
}

FeaturedImage.propTypes = {
	src: React.PropTypes.string
};
