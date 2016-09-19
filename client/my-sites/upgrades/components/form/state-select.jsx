/**
 * External dependencies
 */
const React = require( 'react' ),
	classNames = require( 'classnames' ),
	isEmpty = require( 'lodash/isEmpty' ),
	ReactDom = require( 'react-dom' );

import { connect } from 'react-redux';


/**
 * Internal dependencies
 */
const analytics = require( 'lib/analytics' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormSelect = require( 'components/forms/form-select' ),
	FormInputValidation = require( 'components/forms/form-input-validation' ),
	scrollIntoViewport = require( 'lib/scroll-into-viewport' ),
	Input = require( './input' );

import { getCountryStatesList } from 'state/country-states/selectors';
import QueryCountryStatesList from 'components/data/query-country-states-list';
const StatesSelect = React.createClass({

	displayName: 'StateSelect',

	recordStateSelectClick: function() {
		if ( this.props.eventFormName ) {
			analytics.ga.recordEvent( 'Upgrades', `Clicked ${ this.props.eventFormName } State Select` );
		}
	},

	focus() {
		const node = ReactDom.findDOMNode( this.refs.input );
		if ( node ) {
			node.focus();
			scrollIntoViewport( node );
		} else {
			this.refs.state.focus();
		}
	},

	render: function() {
		const classes = classNames( this.props.additionalClasses, 'state' ),
			statesList = this.props.statesList;
		let options = [];


		if ( isEmpty( statesList ) ) {
			return (
				<div>
					<QueryCountryStatesList countryCode={ this.props.countryCode } />
					<Input ref="state" { ...this.props } />
				</div>
			);
		}

		options.push( { key: '', label: this.translate( 'Select State' ), disabled: 'disabled' } );

		options = options.concat( statesList.map( function( state ) {
			if ( ! state.code ) {
				return { key: '--', label: '', disabled: 'disabled' };
			}
			return { key: state.code, label: state.name };
		} ) );

		return (
			<div className={ classes }>
				<QueryCountryStatesList countryCode={ this.props.countryCode } />
				<div>
					<FormLabel htmlFor={ this.props.name }>{ this.props.label }</FormLabel>
					<FormSelect
						ref="input"
						name={ this.props.name }
						value={ this.props.value }
						disabled={ this.props.disabled }
						onChange={ this.props.onChange }
						onClick={ this.recordStateSelectClick }
						isError={ this.props.isError } >
						{ options.map( function( option ) {
							return <option key={ option.key } value={ option.key } disabled={ option.disabled }>{ option.label }</option>;
						} ) }
					</FormSelect>
				</div>
				{ this.props.errorMessage && <FormInputValidation text={ this.props.errorMessage } isError /> }
			</div>
		);
	}
});

export default connect( ( state, props ) => {
	const statesList = getCountryStatesList( state, props.countryCode );
	return {
		statesList
	};
})( StatesSelect );
