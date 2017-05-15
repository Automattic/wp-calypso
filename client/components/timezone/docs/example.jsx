/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Timezone from 'components/timezone';
import Card from 'components/card';

export default React.createClass( {

	mixins: [ PureRenderMixin ],

	displayName: 'Timezone',

	getInitialState() {
		return {
			timezone: 'America/Argentina/La_Rioja'
		};
	},

	onTimezoneSelect( timezone ) {
		this.setState( { timezone } );
	},

	render() {
		return (
			<Timezone
				selectedZone={ this.state.timezone }
				onSelect={ this.onTimezoneSelect }
			/>
		);
	}
} );
