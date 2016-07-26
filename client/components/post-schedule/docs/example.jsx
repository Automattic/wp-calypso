/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import PostSchedule from 'components/post-schedule';
import Timezone from 'components/timezone';
import Gridicon from 'components/gridicon';
import Card from 'components/card';

/**
 * Date Picker Demo
 */
export default React.createClass( {
	displayName: 'PostSchedule',

	mixins: [ PureRenderMixin ],

	getInitialState() {
		var date = new Date(),
			tz = 'America/Los_Angeles',
			tomorrow = ( new Date() ).setDate( date.getDate() + 1 );

		date.setDate( date.getDate() + 3 );
		date.setMilliseconds( 0 );
		date.setSeconds( 0 );

		date = this.moment( date ).tz( tz );
		date.set( { hour: 11, minute: 20 } );

		return {
			events: [
				{
					id: 1,
					title: 'Happy 30th birthday',
					date: new Date( '2015-07-18T15:00:00' ),
					type: 'birthday'
				},
				{
					id: 2,
					title: 'Tomorrow is tomorrow',
					date: tomorrow
				}
			],
			gmtOffset: 1,
			timezone: tz,
			date: date
		};
	},

	componentWillMount: function() {
		this.setState( {
			isFuture: true
		} );
	},

	setDate( date ) {
		console.log( `date: %s`, date.format() );

		this.setState( {
			isFuture: +new Date() < +new Date( date ),
			date: date
		} );
	},

	setMonth( date ) {
		console.log( `month: %s`, date.format() );
		this.setState( { month: date } );
	},

	setGMTOffset( event ) {
		if ( 'undefined' === typeof event.target.value ) {
			return;
		}

		this.setState( { gmtOffset: Number( event.target.value ) } );
	},

	setTimezone( zone ) {
		this.setState( { timezone: zone } );
	},

	clearState( state, event ) {
		event.preventDefault();
		this.setState( { [ state ]: null } );
	},

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/post-schedule">PostSchedule</a>
				</h2>

				<Card style={ {
					width: '300px',
					verticalAlign: 'top',
					display: 'inline-block',
					margin: 0
				} }>
					<PostSchedule
						events={ this.state.events }
						onDateChange={ this.setDate }
						onMonthChange={ this.setMonth }
						gmtOffset={ this.state.gmtOffset }
						timezone={ this.state.timezone }
						selectedDay={ this.state.date } />
				</Card>

				<div style={ {
					width: '260px',
					display: 'inline-block',
					verticalAlign: 'top',
					margin: ' 0 0 0 30px'
				} }
				>
					<Card className="card__component-instance">
						<h3>
							<span>owner</span>
							<Gridicon icon="arrow-right" size={ 18 } />
							<span>ownee</span>
						</h3>

						<div className="card__block">
							<label>state.timezone</label>
							<div
								className="state-value"
								style={ { fontSize: '11px', marginBottom: '2px' } }
							>
								{ this.state.timezone || 'not defined' }
							</div>

							<Timezone
								selectedZone={ this.state.timezone }
								onSelect={ this.setTimezone }
							/>

							<a
								className="card__property-action"
								style={ {
									top: '-8px',
									position: 'relative'
								} }
								onClick={ this.clearState.bind( this, 'timezone' ) }
								href="#"
							>
								clean timezone
							</a>
						</div>

						<div className="card__block">
							<label>state.gmtOffset</label>
							<input
								className="editable-property"
								type="text"
								onChange={ this.setGMTOffset }
								value={ this.state.gmtOffset }
							/>

							<a
								className="card__property-action"
								onClick={ this.clearState.bind( this, 'gmtOffset' ) }
								href="#"
							>
								clean gmtOffset
							</a>
						</div>

						<div className="card__block">
							<label>state.date</label>
							<div
								className="state-value"
								style={ { fontSize: '11px' } }
							>
								{
									this.state.date
										? this.state.date.format()
										: 'not defined'
								}
							</div>

							<a
								className="card__property-action"
								onClick={ this.clearState.bind( this, 'date' ) }
								href="#"
							>
								clean selectedDay
							</a>
						</div>

					</Card>

					<Card className="card__component-instance">
						<h3>
							<span>owner</span>
							<Gridicon icon="arrow-left" size={ 18 } />
							<span>ownee</span>
						</h3>

						<div className="card__block">
							<label>prop.onDateChange( date )</label>
							<div
								className="state-value"
								style={ { fontSize: '11px' } }
							>
								{
									this.state.date
										? this.state.date.format()
										: 'not defined'
								}
							</div>
						</div>

						<div className="card__block">
							<label>prop.onMonthChange( date )</label>
							<div
								className="state-value"
								style={ { fontSize: '11px' } }
							>
								{
									this.state.month
										? this.state.month.format()
										: 'not defined'
								}
							</div>
						</div>
					</Card>

					<Card className="card__component-instance">
						<label>chronologically: </label>
						{ this.renderDateReference() }
					</Card>

				</div>
			</div>
		);
	},

	renderDateReference() {
		if ( ! this.state.date ) {
			return;
		}

		return (
			<span
				className="state-value"
				style={ {
					marginLeft: '10px',
					fontSize: '11px'
				} }
			>
				{
					this.state.isFuture
						? 'FUTURE'
						: 'PRESENT or PAST'
				}
			</span>
		);
	}
} );
