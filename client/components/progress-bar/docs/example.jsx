/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var ProgressBar = require( 'components/progress-bar' );

module.exports = React.createClass( {
	displayName: 'ProgressBar',

	mixins: [ React.addons.PureRenderMixin ],

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/progress-bar">Progress Bar</a>
				</h2>
				<ProgressBar value={ 0 } title="0% complete"/>
				<ProgressBar value={ 55 } total={ 100 } />
				<ProgressBar value={ 100 } color="#1BABDA" />
			</div>
		);
	}
} );
