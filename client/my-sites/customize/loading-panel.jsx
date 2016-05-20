/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {
	displayName: 'CustomizerLoadingPanel',

	propTypes: {
		isLoaded: React.PropTypes.bool,
	},

	getDefaultProps: function() {
		return {
			isLoaded: false,
		};
	},

	render: function() {
		var noticeClassNames = classNames( {
			'customizer-loading-panel__notice': true,
			'is-iframe-loaded': this.props.isLoaded
		} );

		return (
			<div className={ noticeClassNames }>
				<div className="customizer-loading-panel__notice-label">
					{ this.translate( 'Loading the Customizer…' ) }
				</div>
			</div>
		);
	}
} );
