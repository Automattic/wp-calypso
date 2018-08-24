/** @format */

/**
 * External dependencies
 */
import React from 'react';

const calypsoComponent = WrappedComponent => {
	return class calypsoComponentHOC extends React.Component {
		render() {
			return (
				<div className={ STYLE_NAMESPACE }>
					<WrappedComponent { ...this.props } />
				</div>
			);
		}
	};
};

export default calypsoComponent;
