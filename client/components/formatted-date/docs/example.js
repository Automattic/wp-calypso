/**
 * External dependencies
 *
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

/**
 * Internal dependencies
 */
import FormattedDate from '../';
import { setLocale } from 'state/ui/language/actions';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';

class FormattedDateExample extends PureComponent {
	static displayName = 'FormattedDateExample';

	state = {
		currentDate: new Date(),
		currentDateString: new Date().toISOString(),
		format: 'lll',
	};

	handleDateChange = ( evt ) => {
		const val = moment( evt.target.value );
		if ( val.isValid() ) {
			this.setState( {
				currentDate: val.toDate(),
				currentDateString: evt.target.value,
			} );
		}
	};

	handleLocaleChange = ( evt ) => {
		const val = evt.target.value;
		if ( val.length === 2 || val.length === 5 ) {
			this.props.setLocale( evt.target.value );
		}
	};

	handleFormatChange = ( evt ) => {
		const val = evt.target.value;
		if ( val ) {
			this.setState( { format: val } );
		}
	};

	render() {
		return (
			<div>
				<label>
					Date
					<br />
					<input
						type="text"
						name="theDate"
						onChange={ this.handleDateChange }
						defaultValue={ this.state.currentDateString }
					/>
				</label>
				<label>
					locale
					<br />
					<input
						type="text"
						name="locale"
						onChange={ this.handleLocaleChange }
						defaultValue={ this.props.currentLocale }
					/>
				</label>
				<label>
					format
					<br />
					<input
						type="text"
						name="format"
						onChange={ this.handleFormatChange }
						defaultValue={ this.state.format }
					/>
				</label>
				<FormattedDate date={ this.state.currentDate } format={ this.state.format } />
			</div>
		);
	}
}

const exported = connect(
	( state ) => ( {
		currentLocale: getCurrentLocaleSlug( state ),
	} ),
	{ setLocale }
)( FormattedDateExample );
exported.displayName = 'FormattedDateExample';

export default exported;
