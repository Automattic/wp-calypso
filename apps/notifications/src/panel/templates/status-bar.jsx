/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from './gridicons';

export class StatusBar extends React.Component {
	static defaultProps = {
		statusTimeout: 4000,
	};

	state = {
		isVisible: false,
	};

	disappear = () => {
		this.setState( {
			isVisible: false,
		} );

		this.props.statusReset();
	};

	/*
	 * Use the prop update trap in order to trigger
	 * displaying the status bar. Because we can hook
	 * in here, there is no need to have an explicit
	 * `show()` function.
	 */
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( '' == nextProps.statusMessage ) return;

		if ( nextProps.statusMessage == this.props.statusMessage ) return;

		const component = this;

		/* We only want this to appear for a bit, then disappear */
		window.setTimeout(
			function () {
				component.disappear();
			},
			nextProps.statusTimeout ? nextProps.statusTimeout : this.props.statusTimeout
		);

		this.setState( {
			isVisible: true,
		} );
	}

	render() {
		const visibility = this.state.isVisible ? { display: 'flex' } : { display: 'none' };

		const classes = [ 'wpnc__status-bar' ];
		if ( 'undefined' != typeof this.props.statusClasses && this.props.statusClasses.length > 0 ) {
			classes.push.apply( classes, this.props.statusClasses );
		}

		return (
			<div className={ classes.join( ' ' ) } style={ visibility }>
				<span />
				<span
					dangerouslySetInnerHTML={ {
						__html: this.props.statusMessage,
					} }
				/>
				<button className="wpnc__close-link" onClick={ this.disappear }>
					<Gridicon icon="cross" size={ 18 } />
				</button>
			</div>
		);
	}
}

export default StatusBar;
