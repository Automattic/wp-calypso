/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	Count = require( 'components/count' );

var DraftsButton = React.createClass( {

	render: function() {
		if ( ! config.isEnabled( 'editor-drafts' ) || ! this.props.site ) {
			return null;
		}

		return (
			<button className="drafts-button" onClick={ this.props.onClick } aria-label={ this.translate( 'View all drafts' ) }>
				<span>{ this.translate( 'Drafts' ) }</span>
				{ this.props.count ?
					<Count count={ this.props.count } />
				: null }
			</button>
		);
	}

} );

module.exports = DraftsButton;
