/** @format */

/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */

export default class extends React.Component {
	static displayName = 'Welcome';

	state = {
		visible: !! this.props.isVisible,
	};

	componentWillReceiveProps( nextProps ) {
		var nextVisible = !! nextProps.isVisible;
		if ( nextVisible !== this.state.visible ) {
			this.setState( {
				visible: nextVisible,
			} );
		}
	}

	close = event => {
		event.preventDefault();

		this.setState( {
			visible: false,
		} );

		if ( 'function' === typeof this.props.closeAction ) {
			this.props.closeAction();
		}
	};

	render() {
		var welcomeClassName = this.props.additionalClassName
			? this.props.additionalClassName + ' welcome-message'
			: 'welcome-message';

		if ( this.state.visible ) {
			return (
				<div className={ welcomeClassName }>
					<a href="#" className="close-button" onClick={ this.close }>
						<Gridicon icon="cross" />
					</a>
					{ this.props.children }
				</div>
			);
		} else {
			return null;
		}
	}
}
