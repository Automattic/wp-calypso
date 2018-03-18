/** @format */

/**
 * External dependencies
 */

import LazyRender from 'react-lazily-render';
import PropTypes from 'prop-types';

// This component exists to delay rendering and mounting of components
// until after the page has loaded; this results in less browser lag/thrashing.
// Technically the content will appear either when it is scrolled into view
// or once the delay time has passed (defaults to 20ms).
export default class DelayRender extends LazyRender {
	static propTypes = {
		delay: PropTypes.number,
	};

	static defaultProps = {
		delay: 20,
	};

	componentDidMount = () => {
		this.timeout = setTimeout( () => {
			this.stopListening();
			this.setState( { hasBeenScrolledIntoView: true } );
		}, this.props.delay );
	};

	componentWillUnmout = () => {
		clearTimeout( this.timeout );
	};
}
