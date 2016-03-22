/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var ProgressBar = require( 'components/progress-bar' );

module.exports = React.createClass( {

	displayName: 'ProgressBar',

	mixins: [ PureRenderMixin ],

	getInitialState() {
		return {
			compact: false
		}
	},

	toggleCompact() {
		this.setState( { compact: ! this.state.compact } );
	},

	render() {
		const toggleText = this.state.compact ? 'Normal Bar' : 'Compact Bar';

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/progress-bar">Progress Bar</a>
					<a className="design-assets__toggle button" onClick={ this.toggleCompact }>{ toggleText }</a>
				</h2>
				<ProgressBar value={ 0 } title="0% complete" compact={ this.state.compact } />
				<ProgressBar value={ 55 } total={ 100 } compact={ this.state.compact } />
				<ProgressBar value={ 100 } color="#1BABDA" compact={ this.state.compact } />
			</div>
		);
	}
} );
