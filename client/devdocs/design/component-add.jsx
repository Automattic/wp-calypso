/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class ComponentAdd extends React.Component {
	add = () => {
		this.props.add( this.props.example );
	};

	render() {
		const { name } = this.props;
		return (
			<div>
				<Button onClick={ this.add }>{ name }</Button>
			</div>
		);
	}
}

ComponentAdd.propTypes = {
	translate: PropTypes.func.isRequired,
};

export default ComponentAdd;
