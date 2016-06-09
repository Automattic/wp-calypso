/**
 * External dependencies
 */
import React, { Component } from 'react';
import { get } from 'lodash/object';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormSelect from 'components/forms/form-select';
import {
	getPostTypeFieldOptions,
	getPostTypeFieldValue,
} from 'state/site-settings/exporter/selectors';
import {
	setPostTypeFieldValue,
} from 'state/site-settings/exporter/actions';
import i18n from 'i18n-calypso';

export default class Select extends Component {
	render() {
		const {
			isEnabled,
			isError,
			postType,
			shouldShowPlaceholders,
			value,
			fieldName,
		} = this.props;

		const fieldsForPostType = get( {
			post: [ 'author', 'status', 'start_date', 'end_date', 'category' ],
			page: [ 'author', 'status', 'start_date', 'end_date' ],
		}, postType, [] );

		const label = get( {
			author: i18n.translate( 'Author…' ),
			status: i18n.translate( 'Status…' ),
			start_date: i18n.translate( 'Start Date…' ),
			end_date: i18n.translate( 'End Date…' ),
			category: i18n.translate( 'Category…' ),
		}, fieldName, '' );

		if ( fieldsForPostType.indexOf( this.props.fieldName ) < 0 ) {
			return null;
		}

		const setValue = ( e ) => {
			this.props.setValue( e.target.value );
		};

		const options = this.props.options && this.props.options.map( ( option, i ) => {
			return <option key={ i } value={ option.value }>{ option.label }</option>;
		} );
		return (
			<FormSelect
				className={ shouldShowPlaceholders ? 'exporter__placeholder-select' : '' }
				disabled={ shouldShowPlaceholders || ! isEnabled }
				isError={ isEnabled && isError }
				onChange={ setValue }
				value={ value }
			>
				<option value="">{ label }</option>
				{ options }
			</FormSelect>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const { siteId, postType, fieldName } = ownProps;

	const options = getPostTypeFieldOptions( state, siteId, postType, fieldName );
	const value = getPostTypeFieldValue( state, siteId, postType, fieldName );

	return {
		shouldShowPlaceholders: ! options,
		options,
		value,
	};
};

const mapDispatchToProps = ( dispatch, ownProps ) => {
	const { siteId, postType, fieldName } = ownProps;

	return {
		setValue: ( value ) => dispatch( setPostTypeFieldValue( siteId, postType, fieldName, value ) )
	};
};

export default connect( mapStateToProps, mapDispatchToProps )( Select );
