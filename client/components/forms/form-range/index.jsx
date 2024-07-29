import clsx from 'clsx';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';

import './style.scss';

const noop = () => {};

export default class extends Component {
	static displayName = 'FormRange';

	static propTypes = {
		onChange: PropTypes.func,
	};

	static defaultProps = {
		onChange: noop,
	};

	rangeRef = createRef();

	componentDidMount() {
		if ( this.shouldNormalizeChange() ) {
			this.rangeRef.current.addEventListener( 'change', this.onChange );
		}
	}

	componentWillUnmount() {
		this.rangeRef.current.removeEventListener( 'change', this.onChange );
	}

	shouldNormalizeChange = () => {
		const ua = window.navigator.userAgent;

		// Internet Explorer doesn't trigger the normal "input" event as the
		// user drags the thumb. Instead, it emits the equivalent event on
		// "change", so we watch the change event and emit a simulated event.
		return -1 !== ua.indexOf( 'MSIE' ) || -1 !== ua.indexOf( 'Trident/' );
	};

	onChange = ( event ) => {
		this.props.onChange( event );
	};

	render() {
		const classes = clsx( this.props.className, 'form-range' );

		return (
			<input
				ref={ this.rangeRef }
				type="range"
				className={ classes }
				{ ...omit( this.props, 'className' ) }
			/>
		);
	}
}
