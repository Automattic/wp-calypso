/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var CompactCard = require( 'components/card/compact' ),
	ProgressIndicator = require( 'components/progress-indicator' );

module.exports = React.createClass( {

	displayName: 'PluginToggle',

	render: function() {
		var activeToggleClasses;

		activeToggleClasses = classNames( {
			'toggle': true,
			'is-toggling': this.props.toggling
		} );

		return (
			<CompactCard className="plugin__setting">
				{ this.props.label }
				{ <input
					className={ activeToggleClasses }
					type="checkbox"
					id={ this.props.action + "-" + this.props.siteID }
					name={ this.props.action + '['+this.props.siteID+']' }
					value={ this.props.action }
					checked={ this.props.checked }
					onChange={ this.props.toggle }
					disabled={ this.props.disabled }
					/>
				}
				<label className="toggle-label" htmlFor={ this.props.action + "-" + this.props.siteID }>
					<span className="screen-reader-text">{ this.props.label }</span>
				</label>
				<ProgressIndicator status={ this.props.status } key={ this.props.action + "-" + this.props.siteID + '-progress-indicator' } />
			</CompactCard>
		);
	}
} );
