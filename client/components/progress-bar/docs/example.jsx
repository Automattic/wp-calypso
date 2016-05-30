/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import DocsExample from 'components/docs-example';
import ProgressBar from 'components/progress-bar';

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
		return (
			<DocsExample
				title="Progress Bar"
				url="/devdocs/design/progress-bar"
				componentUsageStats={ this.props.getUsageStats( ProgressBar ) }
				toggleHandler={ this.toggleCompact }
				toggleText={ this.state.compact ? 'Normal Bar' : 'Compact Bar' }
			>
				<ProgressBar value={ 0 } title="0% complete" compact={ this.state.compact } />
				<ProgressBar value={ 55 } total={ 100 } compact={ this.state.compact } />
				<ProgressBar value={ 100 } color="#1BABDA" compact={ this.state.compact } />
			</DocsExample>
		);
	}
} );
