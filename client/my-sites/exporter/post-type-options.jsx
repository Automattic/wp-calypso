/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import { connect } from 'react-redux';
import moment from 'moment';

/**
 * Internal dependencies
 */
import FormRadio from 'components/forms/form-radio';
import Select from './select';
import Label from 'components/forms/form-label';

import { setPostType } from 'state/site-settings/exporter/actions';
import {
	getPostTypeOptions,
	getSelectedPostType,
} from 'state/site-settings/exporter/selectors';

const mapStateToProps = ( state, ownProps ) => {
	const siteId = state.ui.selectedSiteId;
	const options = getPostTypeOptions( state, siteId, ownProps.postType );

	return {
		options,

		// Show placeholders when options are not available
		shouldShowPlaceholders: ! options,

		// Disable options when this post type is not selected
		isEnabled: getSelectedPostType( state ) === ownProps.postType,
	}
}

const mapDispatchToProps = ( dispatch, ownProps ) => {
	return {
		onSelect: () => dispatch( setPostType( ownProps.postType ) )
	}
}

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
		const { options } = this.props;
		const commonProps = {
			disabled: ! this.props.isEnabled
		};

		const mapAuthors = ( authors ) => {
			return authors.map( ( author ) => ( {
				value: author.ID,
				label: author.name
			} ) );
		};

		const mapStatuses = ( statuses ) => {
			return statuses.map( ( status ) => ( {
				value: status.name,
				label: status.label
			} ) );
		}

		const mapCategories = ( categories ) => {
			return categories.map( ( category ) => ( {
				value: category.name,
				label: category.name
			} ) );
		}

		const mapDates = ( dates, endOfMonth = false ) => {
			return dates.map( ( date ) => {
				const year = parseInt( date.year, 10 );
				// API months start at 1 (Jan = 1)
				const month = parseInt( date.month, 10 );
				// JS months start at 0 (Jan = 0)
				const jsMonth = month - 1;

				if ( month === 0 || year === 0 ) {
					return {
						value: '',
						label: this.translate( 'Unknown' )
					}
				}

				let time = moment( { year: year, month: jsMonth, day: 1 } );

				if ( endOfMonth ) {
					time = time.endOf( 'month' );
				}

				return {
					// eg: 2015-06-30
					value: time.format( 'YYYY-MM-DD' ),

					// eg: Dec 2015
					label: time.format( 'MMM YYYY' )
				}
			} );
		}

		return (
			<div className="exporter__option-fieldset-fields">
				{ options.authors &&
					<Select defaultLabel="Author…" options={ mapAuthors( options.authors ) } { ...commonProps } />
				}
				{ options.statuses &&
					<Select defaultLabel="Status…" options={ mapStatuses( options.statuses ) } { ...commonProps } />
				}
				{ options.export_date_options &&
					<Select defaultLabel="Start Date…" options={ mapDates( options.export_date_options ) } { ...commonProps } />
				}
				{ options.export_date_options &&
					<Select defaultLabel="End Date…" options={ mapDates( options.export_date_options, true ) } { ...commonProps } />
				}
				{ options.categories &&
					<Select defaultLabel="Category…" options={ mapCategories( options.categories ) } { ...commonProps } />
				}
			</div>
		);
	},

	render() {
		return (
			<div className="exporter__option-fieldset">

				<Label className="exporter__option-fieldset-legend">
					<FormRadio
						checked={ this.props.isEnabled }
						onChange={ this.props.onSelect }/>
					<span className="exporter__option-fieldset-legend-text">{ this.props.legend }</span>
				</Label>

				{ this.props.description &&
					<p className="exporter__option-fieldset-description">
						{ this.props.description }
					</p>
				}

				{ this.props.shouldShowPlaceholders ? this.renderPlaceholders() : this.renderFields() }
			</div>
		);
	}
} );

export default connect( mapStateToProps, mapDispatchToProps )( PostTypeOptions );
