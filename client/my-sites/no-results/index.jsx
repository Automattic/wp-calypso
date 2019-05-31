/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

class NoResults extends React.Component {
	static defaultProps = {
		text: 'No results',
		image: false,
	};

	render() {
		return (
			<div className="no-results">
				{ this.props.image ? (
					<img className="no-results__img" src={ this.props.image } alt="" />
				) : null }
				<span>{ this.props.text }</span>
			</div>
		);
	}
}

export default NoResults;
