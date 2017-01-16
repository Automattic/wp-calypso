/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var SiteIcon = require( 'blocks/site-icon' );

module.exports = React.createClass( {

	displayName: 'PostHeader',

	getDefaultProps: function() {
		return {
			showAuthor: false
		};
	},

	getAuthor: function() {
		return this.translate(
			'By %(author)s',
			{ args: { author: this.props.author } }
		);
	},

	render: function() {
		var classes;

		classes = classNames( {
			'post__header': true,
			'has-author': this.props.showAuthor
		} );

		return (
			<div className={ classes }>
				<SiteIcon site={ this.props.site } size={ 32 } />
				<h4 className="post__site-title">
					<a href={ this.props.path + '/' + this.props.site.slug }>
						{ this.props.site.title }
					</a>
				</h4>
				{ this.props.showAuthor ? <span className="post__author">{ this.getAuthor() }</span> : null }
			</div>
		);

	}

} );
