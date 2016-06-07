/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import { connect } from 'react-redux';
import { get } from 'lodash/object';

/**
 * Internal dependencies
 */
import FormRadio from 'components/forms/form-radio';
import Label from 'components/forms/form-label';
import Select from './select';

import { setPostType, setPostTypeFieldValue } from 'state/site-settings/exporter/actions';
import {
	getPostTypeFieldOptions,
	getPostTypeFieldValues,
	getSelectedPostType,
	isDateValid as isExportDateValid,
} from 'state/site-settings/exporter/selectors';

const mapStateToProps = ( state, ownProps ) => {
	const siteId = state.ui.selectedSiteId;
	const fields = getPostTypeFieldOptions( state, siteId, ownProps.postType );
	const fieldValues = getPostTypeFieldValues( state, siteId, ownProps.postType );

	return {
		siteId,
		fields,
		fieldValues,

		isDateValid: isExportDateValid( state, siteId, ownProps.postType ),

		// Show placeholders when fields options are not yet available
		shouldShowPlaceholders: ! fields,

		// Disable options when this post type is not selected
		isEnabled: getSelectedPostType( state ) === ownProps.postType,
	};
};

const mapDispatchToProps = ( dispatch, ownProps ) => ( {
	onSelect: () => dispatch( setPostType( ownProps.postType ) ),
	setPostTypeFieldValue: ( ...args ) => dispatch( setPostTypeFieldValue( ...args ) ),
} );

/**
 * Displays a list of select menus with a radio option legend
 *
 * Displays a field group with a radio legend and optionally
 * a list of select menus, or a description to appear beneath the
 * legend.
 */

const PostTypeOptions = React.createClass( {
	displayName: 'PostTypeOptions',

	mixins: [ PureRenderMixin ],

	propTypes: {
		onSelect: PropTypes.func,

		legend: PropTypes.string.isRequired,
	},

	renderFields() {
		const {
			fields,
			fieldValues,
			postType,
			shouldShowPlaceholders,
			siteId,
			isDateValid,
		} = this.props;

		const fieldsForPostType = get( {
			post: [ 'author', 'status', 'start_date', 'end_date', 'category' ],
			page: [ 'author', 'status', 'start_date', 'end_date' ],
		}, postType, [] );

		const Field = ( props ) => {
			const options = get( fields, props.options, [] );

			// Should the field be displayed for this post type?
			if ( fieldsForPostType.indexOf( props.fieldName ) < 0 ) {
				// This can be replaced with `return null` in React >= 0.15
				return <span/>;
			}

			const setFieldValue = ( e ) => {
				this.props.setPostTypeFieldValue( siteId, postType, props.fieldName, e.target.value );
			};

			return <Select
				className={ shouldShowPlaceholders ? 'exporter__placeholder-select' : '' }
				onChange={ setFieldValue }
				key={ props.defaultLabel }
				defaultLabel={ props.defaultLabel }
				options={ options }
				isError={ this.props.isEnabled && props.isError }
				value={ fieldValues[ props.fieldName ] }
				disabled={ shouldShowPlaceholders || ! this.props.isEnabled } />;
		};

		return (
			<div className="exporter__option-fieldset-fields">
				<Field defaultLabel={ this.translate( 'Author…' ) } fieldName="author" options="authors" />
				<Field defaultLabel={ this.translate( 'Status…' ) } fieldName="status" options="statuses" />
				<Field defaultLabel={ this.translate( 'Start Date…' ) } fieldName="start_date" options="dates" isError={ ! isDateValid } />
				<Field defaultLabel={ this.translate( 'End Date…' ) } fieldName="end_date" options="dates" isError={ ! isDateValid } />
				<Field defaultLabel={ this.translate( 'Category…' ) } fieldName="category" options="categories" />
			</div>
		);
	},

	render() {
		const {
			isEnabled,
			onSelect,
			legend,
			description,
		} = this.props;

		return (
			<div className="exporter__option-fieldset">

				<Label className="exporter__option-fieldset-legend">
					<FormRadio
						checked={ isEnabled }
						onChange={ onSelect }/>
					<span className="exporter__option-fieldset-legend-text">{ legend }</span>
				</Label>

				{ description &&
					<p className="exporter__option-fieldset-description">
						{ description }
					</p>
				}

				{ this.renderFields() }
			</div>
		);
	}
} );

export default connect( mapStateToProps, mapDispatchToProps )( PostTypeOptions );
