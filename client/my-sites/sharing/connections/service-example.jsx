/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

class SharingServiceExample extends Component {
	static propTypes = {
		image: PropTypes.shape( {
			src: PropTypes.string,
			alt: PropTypes.string
		} ),
		label: PropTypes.node,
		single: PropTypes.bool,
	};

	static defaultProps = {
		single: false,
	};

	render() {
		const classes = classNames( 'sharing-service-example', {
			'is-single': this.props.single
		} );

		return (
			<div className={ classes }>
				<div className="sharing-service-example-screenshot">
					<img src={ this.props.image.src } alt={ this.props.image.alt } />
				</div>
				<div className="sharing-service-example-screenshot-label">{ this.props.label }</div>
			</div>
		);
	}
}

export default SharingServiceExample;
