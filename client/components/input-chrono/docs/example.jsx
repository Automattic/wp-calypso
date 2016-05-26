/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DocsExample from 'components/docs-example';
import InputChrono from 'components/input-chrono';

/**
 * Date Picker Demo
 */
export default React.createClass( {
	displayName: 'InputChrono',

	mixins: [ PureRenderMixin ],

	getInitialState() {
		return {
			date: this.moment()
		};
	},

	componentWillMount() {
		var self = this;
		this.interval = setInterval( function() {
			var date = self.moment( self.state.date );
			date.hours( date.hours() + 1 );
			self.setState( { date: date } );
		}, 1000 );
	},

	componentWillUnmount() {
		clearInterval( this.interval );
	},

	onSet( date ) {
		console.log( `date: %s`, date.toDate() );
		this.setState( { date: date } );
	},

	render() {
		return (
			<DocsExample
				title="InputChrono"
				url="/devdocs/design/input-chrono"
				componentUsageStats={ this.props.getUsageStats( InputChrono ) }
			>
				<Card style={ { width: '300px', margin: 0 } }>
					<InputChrono
						value={ this.state.date.calendar() }
						onSet={ this.onSet }/>
				</Card>
			</DocsExample>
		);
	}
} );
