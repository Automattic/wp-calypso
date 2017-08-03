/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Gridicon = require( 'gridicons' );

module.exports = React.createClass( {
	displayName: 'MediaLibraryListItemFileDetails',

	propTypes: {
		media: React.PropTypes.object,
		scale: React.PropTypes.number,
		icon: React.PropTypes.string
	},

	getDefaultProps: function() {
		return {
			icon: 'pages'
		};
	},

	render: function() {
		return (
			<div className="media-library__list-item-file-details media-library__list-item-centered">
				<div className="media-library__list-item-icon">
					<Gridicon icon={ this.props.icon } />
				</div>
				<div className="media-library__list-item-file-name" style={ { fontSize: 12 * ( 1 + this.props.scale ) } }>
					{ this.props.media.title }
				</div>
				<hr className="media-library__list-item-details-separator" />
				<div className="media-library__list-item-file-extension" style={ { fontSize: 9 * ( 1 + this.props.scale ) } }>
					{ ( this.props.media.extension || '' ).toUpperCase() }
				</div>
			</div>
		);
	}
} );
