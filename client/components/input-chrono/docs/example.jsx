import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import InputChrono from 'calypso/components/input-chrono';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

// Date Picker Demo
const InputChronoExample = localize(
	withLocalizedMoment(
		class extends PureComponent {
			state = {
				date: this.props.moment(),
			};

			componentDidMount() {
				this.interval = setInterval( () => {
					const date = this.props.moment( this.state.date );
					date.hours( date.hours() + 1 );
					this.setState( { date: date } );
				}, 1000 );
			}

			componentWillUnmount() {
				clearInterval( this.interval );
			}

			onSet = ( date ) => {
				console.log( `date: %s`, date.toDate() );
				this.setState( { date: date } );
			};

			render() {
				return (
					<Card style={ { width: '300px', margin: 0 } }>
						<InputChrono value={ this.state.date.calendar() } onSet={ this.onSet } />
					</Card>
				);
			}
		}
	)
);

InputChronoExample.displayName = 'InputChrono';

export default InputChronoExample;
