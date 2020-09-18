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
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormattedDate from '../';
import { setLocale } from 'state/ui/language/actions';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';

class FormattedDateExample extends PureComponent {
	static displayName = 'FormattedDateExample';

	constructor( props ) {
		super( props );

		this.state = {
			currentDate: new Date(),
			currentDateString: new Date().toISOString(),
			currentLocale: props.currentLocale,
			format: 'lll',
		};
	}

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

		this.setState( {
			currentLocale: val,
		} );

		if ( val.length === 2 || val.length === 5 ) {
			this.props.setLocale( val );
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
				<FormLabel>
					Date
					<br />
					<FormTextInput
						onChange={ this.handleDateChange }
						value={ this.state.currentDateString }
					/>
				</FormLabel>
				<FormLabel>
					locale
					<br />
					<FormTextInput onChange={ this.handleLocaleChange } value={ this.state.currentLocale } />
				</FormLabel>
				<FormLabel>
					format
					<br />
					<FormTextInput onChange={ this.handleFormatChange } value={ this.state.format } />
				</FormLabel>
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
