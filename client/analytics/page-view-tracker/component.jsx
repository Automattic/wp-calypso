import React, { PropTypes } from 'react';

export const PageViewTracker = recorder => React.createClass( {
	getInitialState: () => ( {
		timer: null
	} ),

	componentDidMount() {
		this.queuePageView();
	},

	componentWillUnmount() {
		clearTimeout( this.state.timer );
	},

	queuePageView() {
		const {
			delay = 0,
			path,
			title
		} = this.props;

		if ( this.state.timer ) {
			return;
		}

		if ( ! delay ) {
			return recorder( path, title );
		}

		this.setState( {
			timer: setTimeout( () => recorder( path, title ), delay )
		} );
	},

	render: () => null
} );

PageViewTracker.propTypes = {
	delay: PropTypes.number,
	path: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired
};

export default PageViewTracker;
