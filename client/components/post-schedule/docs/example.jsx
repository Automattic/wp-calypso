/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import PostSchedule from 'components/post-schedule';
import Timezone from 'components/timezone';
import { Card } from '@automattic/components';
import EventsTooltip from 'components/date-picker/events-tooltip';
import { withLocalizedMoment } from 'components/localized-moment';

// Date Picker Demo
const PostScheduleExample = localize(
	withLocalizedMoment(
		class extends React.PureComponent {
			constructor( props ) {
				super( props );
				let date = new Date();
				const tz = 'America/Los_Angeles';
				const tomorrow = new Date().setDate( date.getDate() + 1 );

				date.setDate( date.getDate() + 3 );
				date.setMilliseconds( 0 );
				date.setSeconds( 0 );

				date = props.moment( date ).tz( tz );
				date.set( { hour: 11, minute: 20 } );

				this.state = {
					events: [
						{
							id: 1,
							title: 'Happy 30th birthday',
							date: new Date( '2015-07-18T15:00:00' ),
							type: 'birthday',
						},
						{
							id: 2,
							title: 'Tomorrow is tomorrow',
							date: tomorrow,
						},
						{
							id: 3,
							title: 'WordCamp Lima 2016!',
							date: new Date( '2016-07-16T09:00:00' ),
							type: 'wordcamp-event',
						},
					],
					gmtOffset: 1,
					timezone: tz,
					date: date,

					eventsByDay: [],
					showTooltip: false,
					tooltipContext: null,
				};
			}

			UNSAFE_componentWillMount() {
				this.setState( {
					isFuture: true,
				} );
			}

			setDate = ( date ) => {
				console.log( 'date: ', date.format() ); // eslint-disable-line no-console

				this.setState( {
					isFuture: +new Date() < +new Date( date ),
					date: date,
				} );
			};

			setMonth = ( date ) => {
				console.log( 'month: %s', date.format() ); // eslint-disable-line no-console
				this.setState( { month: date } );
			};

			setGMTOffset = ( event ) => {
				if ( typeof event.target.value === 'undefined' ) {
					return;
				}

				this.setState( { gmtOffset: Number( event.target.value ) } );
			};

			setTimezone = ( zone ) => {
				this.setState( { timezone: zone } );
			};

			clearState = ( state, event ) => {
				event.preventDefault();
				this.setState( { [ state ]: null } );
			};

			handleDayMouseEnter = ( date, modifiers, event, eventsByDay ) => {
				this.setState( {
					eventsByDay,
					tooltipContext: event.target,
					showTooltip: true,
				} );
			};

			handleDayMouseLeave = () => {
				this.setState( {
					eventsByDay: [],
					tooltipContext: null,
					showTooltip: false,
				} );
			};

			render() {
				return (
					<div>
						<Card
							style={ {
								width: '300px',
								verticalAlign: 'top',
								display: 'inline-block',
								margin: 0,
							} }
						>
							<PostSchedule
								events={ this.state.events }
								onDateChange={ this.setDate }
								onMonthChange={ this.setMonth }
								gmtOffset={ this.state.gmtOffset }
								timezone={ this.state.timezone }
								onDayMouseEnter={ this.handleDayMouseEnter }
								onDayMouseLeave={ this.handleDayMouseLeave }
								selectedDay={ this.state.date }
							/>

							<EventsTooltip
								events={ this.state.eventsByDay }
								context={ this.state.tooltipContext }
								isVisible={ this.state.showTooltip }
							/>
						</Card>

						<div
							style={ {
								width: '260px',
								display: 'inline-block',
								verticalAlign: 'top',
								margin: ' 0 0 0 30px',
							} }
						>
							<Card className="card__component-instance">
								<h3>
									<span>owner</span>
									<Gridicon icon="arrow-right" size={ 18 } />
									<span>ownee</span>
								</h3>

								<div className="card__block">
									<label>
										state.timezone
										<div
											className="state-value"
											style={ { fontSize: '11px', marginBottom: '2px' } }
										>
											{ this.state.timezone || 'not defined' }
										</div>
									</label>

									<Timezone selectedZone={ this.state.timezone } onSelect={ this.setTimezone } />

									<button
										className="card__property-action"
										style={ {
											top: '-8px',
											position: 'relative',
										} }
										onClick={ this.clearState.bind( this, 'timezone' ) }
										href="#"
									>
										clean timezone
									</button>
								</div>

								<div className="card__block">
									<label>
										state.gmtOffset
										<input
											className="editable-property"
											type="text"
											onChange={ this.setGMTOffset }
											value={ this.state.gmtOffset }
										/>
									</label>

									<button
										className="card__property-action"
										onClick={ this.clearState.bind( this, 'gmtOffset' ) }
										href="#"
									>
										clean gmtOffset
									</button>
								</div>

								<div className="card__block">
									<label>
										state.date
										<div className="state-value" style={ { fontSize: '11px' } }>
											{ this.state.date ? this.state.date.format() : 'not defined' }
										</div>
									</label>

									<button
										className="card__property-action"
										onClick={ this.clearState.bind( this, 'date' ) }
										href="#"
									>
										clean selectedDay
									</button>
								</div>
							</Card>

							<Card className="card__component-instance">
								<h3>
									<span>owner</span>
									<Gridicon icon="arrow-left" size={ 18 } />
									<span>ownee</span>
								</h3>

								<div className="card__block">
									<label>
										prop.onDateChange( date )
										<div className="state-value" style={ { fontSize: '11px' } }>
											{ this.state.date ? this.state.date.format() : 'not defined' }
										</div>
									</label>
								</div>

								<div className="card__block">
									<label>
										prop.onMonthChange( date )
										<div className="state-value" style={ { fontSize: '11px' } }>
											{ this.state.month ? this.state.month.format() : 'not defined' }
										</div>
									</label>
								</div>
							</Card>

							<Card className="card__component-instance">
								<label>
									chronologically:
									{ this.renderDateReference() }
								</label>
							</Card>
						</div>
					</div>
				);
			}

			renderDateReference = () => {
				if ( ! this.state.date ) {
					return;
				}

				return (
					<span
						className="state-value"
						style={ {
							marginLeft: '10px',
							fontSize: '11px',
						} }
					>
						{ this.state.isFuture ? 'FUTURE' : 'PRESENT or PAST' }
					</span>
				);
			};
		}
	)
);

PostScheduleExample.displayName = 'PostSchedule';

export default PostScheduleExample;
