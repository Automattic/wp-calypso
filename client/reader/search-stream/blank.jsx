const React = require( 'react' );

const BlankContent = React.createClass( {

	propTypes: {
		suggestions: React.PropTypes.array
	},

	shouldComponentUpdate: function() {
		return false;
	},

	render: function() {
		const suggest = this.props.suggestions
			? <p>{this.translate( 'Staff Suggestions:')} { this.props.suggestions }.</p>
			: null;
		const img_path = '/calypso/images/drake/drake-404.svg';
		return (
			<div className="search-blank-content">
				{ suggest }
				<img src={ img_path } width="500" className="empty-content__illustration" />
			</div>
		);
	}
} );

module.exports = BlankContent;
