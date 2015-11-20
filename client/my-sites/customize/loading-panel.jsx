/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {
	displayName: 'CustomizerLoadingPanel',

	propTypes: {
		isLoaded: React.PropTypes.bool,
		isMuse: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			isLoaded: false,
			isMuse: false
		};
	},

	render: function() {
		var noticeClassNames = classNames( {
			'customizer-loading-panel__notice': true,
			'is-iframe-loaded': this.props.isLoaded
		} );
		if ( this.props.isMuse ) {
			return (
				<div className={ noticeClassNames }>
					<div className="customizer-loading-panel__muse-status">
						<div className="customizer-loading-panel__button is-close">{ this.translate( 'Close' ) }</div>
						<div className="customizer-loading-panel__status-message">
							{ this.translate( 'Loading' ) }
							<span className="customizer-loading-panel__loading-dot-one">.</span><span className="customizer-loading-panel__loading-dot-two">.</span><span className="customizer-loading-panel__loading-dot-three">.</span>
						</div>
						<div className="customizer-loading-panel__button is-save">{ this.translate( 'Save' ) }</div>
					</div>
					<div className="customizer-loading-panel__content">
						<div className="customizer-loading-panel__site-placeholder">
							<div className="customizer-loading-panel__placeholder-bar"></div><div className="customizer-loading-panel__placeholder-bar"></div><div className="customizer-loading-panel__placeholder-bar is-medium"></div>
							<div className="customizer-loading-panel__placeholder-bar is-large"></div><div className="customizer-change-theme__placeholder-circle"></div>
						</div>
					</div>
					<div className="customizer-loading-panel__placeholder-change-theme">
						<div className="customizer-loading-panel__placeholder-change-theme-button">{ this.translate( 'Change Theme' ) }</div>
					</div>
				</div>
			);
		}

		return (
			<div className={ noticeClassNames }>
				<div className="customizer-loading-panel__notice-label">
					{ this.translate( 'Loading the Customizer…' ) }
				</div>
			</div>
		);
	}
} );
