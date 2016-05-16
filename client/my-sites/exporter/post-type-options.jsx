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
	};
};

const mapDispatchToProps = ( dispatch, ownProps ) => {
	return {
		onSelect: () => dispatch( setPostType( ownProps.postType ) )
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
		const { options } = this.props;

		const Field = ( props ) => {
			if ( ! props.options ) {
				// This should be replaced with `return null` in React >= 0.15
				return <span/>;
			}

			return <Select
				key={ props.defaultLabel }
				defaultLabel={ props.defaultLabel }
				options={ props.options }
				disabled={ ! this.props.isEnabled } />;
		};

		return (
			<div className="exporter__option-fieldset-fields">
				<Field defaultLabel="Author…" options={ options.authors } />
				<Field defaultLabel="Status…" options={ options.statuses } />
				<Field defaultLabel="Start Date…" options={ options.dates } />
				<Field defaultLabel="End Date…" options={ options.dates } />
				<Field defaultLabel="Category…" options={ options.categories } />
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
