/**
 * External dependencies
 */
var React = require( 'react/addons' );

/**
 * Internal dependencies
 */
var DocService = require( './service' );
var highlight = require( 'lib/highlight' );

module.exports = React.createClass( {
	displayName: 'SingleDocument',
	propTypes: {
		path: React.PropTypes.string.isRequired,
		term: React.PropTypes.string,
		sectionId: React.PropTypes.string
	},
	timeoutID: null,

	getInitialState: function() {
		return {
			body: ''
		};
	},

	componentDidMount: function() {
		this.fetch();
	},

	componentDidUpdate: function( prevProps ) {
		if ( this.props.path !== prevProps.path ) {
			this.fetch();
		}
		if ( this.state.body ) {
			this.setBodyScrollPosition();
		}
	},

	componentWillUnmount: function() {
		this.clearLoadingMessage();
	},

	fetch: function() {
		this.setState( {
			body: ''
		} );
		this.delayLoadingMessage();
		DocService.fetch( this.props.path, function( err, body ) {
			if ( this.isMounted() ) {
				this.setState( {
					body: ( err || body )
				} );
			}
		}.bind( this ) );
	},

	setBodyScrollPosition: function() {
		if ( this.props.sectionId ) {
			var sectionNode = document.getElementById( this.props.sectionId );

			if ( sectionNode ) {
				sectionNode.scrollIntoView();
			}
		}
	},

	delayLoadingMessage: function() {
		this.clearLoadingMessage();
		this.timeoutID = setTimeout( function() {
			if ( ! this.state.body ) {
				this.setState( {
					body: 'Loading…'
				} );
			}
		}.bind( this ), 1000 );
	},

	clearLoadingMessage: function() {
		if ( 'number' === typeof this.timeoutID ) {
			window.clearTimeout( this.timeoutID );
			this.timeoutID = null;
		}
	},

	render: function() {

		var editURL = encodeURI( 'https://github.com/Automattic/calypso-pre-oss/edit/master/' + this.props.path ) +
			'?message=Documentation: <title>&description=What did you change and why&target_branch=update/docs-your-title';

		return (
			<div className="devdocs devdocs__doc">
				<header>
					<h2>
						Path: <code>{ this.props.path }</code>
						<a href={ editURL } target="_blank">Improve this document on GitHub &rarr;</a>
					</h2>
				</header>
				<div ref="body" dangerouslySetInnerHTML={{ __html: highlight( this.props.term, this.state.body ) }}></div>
			</div>
		);
	}
} );
