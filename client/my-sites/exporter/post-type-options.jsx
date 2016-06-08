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
import Label from 'components/forms/form-label';
import Select from './select';
import Tooltip from 'components/tooltip';

import { setPostType } from 'state/site-settings/exporter/actions';
import {
	getSelectedPostType,
	isDateValid as isExportDateValid,
} from 'state/site-settings/exporter/selectors';

const mapStateToProps = ( state, ownProps ) => {
	const siteId = state.ui.selectedSiteId;

	return {
		siteId,

		isDateValid: isExportDateValid( state, siteId, ownProps.postType ),

		// Disable options when this post type is not selected
		isEnabled: getSelectedPostType( state ) === ownProps.postType,
	};
};

const mapDispatchToProps = ( dispatch, ownProps ) => ( {
	onSelect: () => dispatch( setPostType( ownProps.postType ) ),
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
		legend: PropTypes.string.isRequired,
	},

	render() {
		const {
			description,
			legend,
			isDateValid,
			isEnabled,
			onSelect,
			postType,
			siteId,
		} = this.props;

		const fields = [ 'author', 'status', 'start_date', 'end_date', 'category' ];
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

				<div className="exporter__option-fieldset-fields">
					{ fields.map( fieldName =>
						<Select key={ fieldName }
							ref={ fieldName }
							siteId={ siteId }
							postType={ postType }
							fieldName={ fieldName }
							isEnabled={ isEnabled }
							isError={ ( fieldName === 'start_date' || fieldName === 'end_date' ) && ! isDateValid }
						/>
					) }
				</div>

				<Tooltip
					context={ this.refs && this.refs.start_date }
					status="error"
					isVisible={ isEnabled && ! this.props.isDateValid }>
						{ this.translate( 'Selected start date is later than the end date' ) }
				</Tooltip>
			</div>
		);
	}
} );

export default connect( mapStateToProps, mapDispatchToProps )( PostTypeOptions );
