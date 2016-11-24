/** @ssr-ready **/

/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { PropTypes } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

export default React.createClass( {
	displayName: 'RootChild',

	propTypes: {
		children: PropTypes.node
	},

	contextTypes: {
		store: PropTypes.object
	},

	componentDidMount: function() {
		this.container = document.createElement( 'div' );
		document.body.appendChild( this.container );
		this.renderChildren();
	},

	componentDidUpdate: function() {
		this.renderChildren();
	},

	componentWillUnmount: function() {
		if ( ! this.container ) {
			return;
		}

		ReactDom.unmountComponentAtNode( this.container );
		document.body.removeChild( this.container );
		delete this.container;
	},

	renderChildren: function() {
		var content;

		if ( this.props &&
			( Object.keys( this.props ).length > 1 || ! this.props.children )
		) {
			content = <div { ...this.props }>{ this.props.children }</div>;
		} else {
			content = this.props.children;
		}

		// Context is lost when creating a new render hierarchy, so ensure that
		// we preserve the context that we care about
		if ( this.context.store ) {
			content = (
				<ReduxProvider store={ this.context.store }>
					{ content }
				</ReduxProvider>
			);
		}

		ReactDom.render( content, this.container );
	},

	render: function() {
		return null;
	}
} );
