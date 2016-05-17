/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormRadio from 'components/forms/form-radio';
import Select from './select';
import Label from 'components/forms/form-label';

import { setPostType, setPostTypeFilters } from 'state/site-settings/exporter/actions';
import {
	getPostTypeOptions,
	getPostTypeValues,
	getSelectedPostType,
} from 'state/site-settings/exporter/selectors';

const mapStateToProps = ( state, ownProps ) => {
	const siteId = state.ui.selectedSiteId;
	const options = getPostTypeOptions( state, siteId, ownProps.postType );
	const values = getPostTypeValues( state, siteId, ownProps.postType );

	return {
		siteId,
		options,
		values,

		// Show placeholders when options are not available
		shouldShowPlaceholders: ! options,

		// Disable options when this post type is not selected
		isEnabled: getSelectedPostType( state ) === ownProps.postType,
	};
};

const mapDispatchToProps = ( dispatch, ownProps ) => {
	return {
		onSelect: () => dispatch( setPostType( ownProps.postType ) ),
		setPostTypeFilters: ( ...args ) => dispatch( setPostTypeFilters( ...args ) ),
	};
};

/**
 * Displays a list of select menus with a checkbox legend
 *
 * Displays a field group with a checkbox legend and optionally
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

	renderPlaceholders() {
		return (
			<div className="exporter__option-fieldset-fields">
				<div className="exporter__placeholder-text">
					{ this.translate( 'Loading options…' ) }
				</div>
			</div>
		);
	},

	renderFields() {
		const {
			options,
			siteId,
			postType,
			values,
		} = this.props;

		const Field = ( props ) => {
			if ( ! props.options ) {
				// This should be replaced with `return null` in React >= 0.15
				return <span/>;
			}

			const setFieldValue = ( e ) => {
				this.props.setPostTypeFilters( siteId, postType, props.fieldName, e.target.value );
			};

			return <Select
				onChange={ setFieldValue }
				key={ props.defaultLabel }
				defaultLabel={ props.defaultLabel }
				options={ props.options }
				value={ values[ props.fieldName ] }
				disabled={ ! this.props.isEnabled } />;
		};

		return (
			<div className="exporter__option-fieldset-fields">
				<Field defaultLabel={ this.translate( 'Author…' ) } fieldName="author" options={ options.authors } />
				<Field defaultLabel={ this.translate( 'Status…' ) } fieldName="status" options={ options.statuses } />
				<Field defaultLabel={ this.translate( 'Start Date…' ) } fieldName="start_date" options={ options.dates } />
				<Field defaultLabel={ this.translate( 'End Date…' ) } fieldName="end_date" options={ options.dates } />
				<Field defaultLabel={ this.translate( 'Category…' ) } fieldName="category" options={ options.categories } />
			</div>
		);
	},

	render() {
		const {
			isEnabled,
			onSelect,
			legend,
			description,
			shouldShowPlaceholders
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

				{ shouldShowPlaceholders ? this.renderPlaceholders() : this.renderFields() }
			</div>
		);
	}
} );

export default connect( mapStateToProps, mapDispatchToProps )( PostTypeOptions );
