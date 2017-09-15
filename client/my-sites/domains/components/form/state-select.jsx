/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormInputValidation from 'components/forms/form-input-validation';
import { getCountryStates } from 'state/country-states/selectors';
import Input from './input';
import QueryCountryStates from 'components/data/query-country-states';
import { recordGoogleEvent } from 'state/analytics/actions';
import scrollIntoViewport from 'lib/scroll-into-viewport';

class StateSelect extends Component {
	static instances = 0;

	componentWillMount() {
		this.instance = ++this.constructor.instances;
	}

	recordStateSelectClick = () => {
		const { eventFormName, recordGoogleEvent: recordEvent } = this.props;

		if ( eventFormName ) {
			recordEvent( 'Upgrades', `Clicked ${ eventFormName } State Select` );
		}
	};

	focus() {
		const node = ReactDom.findDOMNode( this.refs.input );
		if ( node ) {
			node.focus();
			scrollIntoViewport( node );
		} else {
			this.refs.state.focus();
		}
	}

	render() {
		const classes = classNames( this.props.additionalClasses, 'state' );

		return (
			<div>
				{ this.props.countryCode && <QueryCountryStates countryCode={ this.props.countryCode } /> }
				{ isEmpty( this.props.countryStates )
					? <Input ref="input" { ...this.props } />
					: <div className={ classes }>
						<FormLabel htmlFor={ `${ this.constructor.name }-${ this.instance }` }>{ this.props.label }</FormLabel>
						<FormSelect
							ref="input"
							id={ `${ this.constructor.name }-${ this.instance }` }
							name={ this.props.name }
							value={ this.props.value }
							disabled={ this.props.disabled }
							onChange={ this.props.onChange }
							onClick={ this.recordStateSelectClick }
							isError={ this.props.isError }
							inputRef={ this.props.inputRef } >

							<option key="--" value="--" disabled="disabled">{ this.props.translate( 'Select State' ) }</option>
							{ this.props.countryStates.map( ( state ) =>
								<option key={ state.code } value={ state.code }>{ state.name }</option>
							) }
						</FormSelect>
						{ this.props.errorMessage && <FormInputValidation text={ this.props.errorMessage } isError /> }
					</div>
				}
			</div>
		);
	}
}

StateSelect.propTypes = {
	additionalClasses: PropTypes.string,
	countryCode: PropTypes.string,
	countryStates: PropTypes.array,
	disabled: PropTypes.bool,
	errorMessage: PropTypes.string,
	eventFormName: PropTypes.string,
	isError: PropTypes.bool,
	label: PropTypes.string,
	name: PropTypes.string,
	onChange: PropTypes.func,
	value: PropTypes.string,
	inputRef: PropTypes.func,
};

export default connect(
	( state, { countryCode } ) => ( {
		countryStates: countryCode ? getCountryStates( state, countryCode ) : []
	} ),
	{ recordGoogleEvent }
)( localize( StateSelect ) );
