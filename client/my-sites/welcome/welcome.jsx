/** @format */

/**
 * External dependencies
 */

import React from 'react';
import GridiconCross from 'gridicons/dist/cross';

/**
 * Internal dependencies
 */

export default class extends React.Component {
	static displayName = 'Welcome';

	state = {
		visible: !! this.props.isVisible,
	};

	componentWillReceiveProps( nextProps ) {
		const nextVisible = !! nextProps.isVisible;
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
		const welcomeClassName = this.props.additionalClassName
			? this.props.additionalClassName + ' welcome-message'
			: 'welcome-message';

		if ( this.state.visible ) {
			return (
				<div className={ welcomeClassName }>
					<a href="#" className="close-button" onClick={ this.close }>
						<GridiconCross />
					</a>
					{ this.props.children }
				</div>
			);
		}
		return null;
	}
}
