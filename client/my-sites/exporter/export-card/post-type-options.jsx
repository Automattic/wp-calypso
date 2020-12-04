/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormRadio from 'calypso/components/forms/form-radio';
import Label from 'calypso/components/forms/form-label';
import Select from './select';
import Tooltip from 'calypso/components/tooltip';
import { setPostType } from 'calypso/state/exporter/actions';
import {
	getSelectedPostType,
	isDateRangeValid as isExportDateRangeValid,
} from 'calypso/state/exporter/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

const mapStateToProps = ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,

		isDateValid: isExportDateRangeValid( state, siteId, ownProps.postType ),

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

class PostTypeOptions extends React.PureComponent {
	static displayName = 'PostTypeOptions';

	static propTypes = {
		legend: PropTypes.string.isRequired,
	};

	render() {
		const { description, legend, isDateValid, isEnabled, onSelect, postType, siteId } = this.props;

		const fields = [ 'author', 'status', 'start_date', 'end_date', 'category' ];

		const setRef = ( fieldName ) => ( c ) => {
			if ( fieldName === 'start_date' ) {
				this._startDate = c;
			}
		};

		return (
			<div className="export-card__option-fieldset">
				<Label>
					<FormRadio checked={ isEnabled } onChange={ onSelect } label={ legend } />
				</Label>

				{ description && (
					<p className="export-card__option-fieldset-description">{ description }</p>
				) }

				<div className="export-card__option-fieldset-fields">
					{ fields.map( ( fieldName ) => (
						<Select
							key={ fieldName }
							ref={ setRef( fieldName ) }
							siteId={ siteId }
							postType={ postType }
							fieldName={ fieldName }
							isEnabled={ isEnabled }
							isError={
								( fieldName === 'start_date' || fieldName === 'end_date' ) && ! isDateValid
							}
						/>
					) ) }
				</div>

				<Tooltip
					context={ this._startDate }
					status="error"
					isVisible={ isEnabled && ! this.props.isDateValid }
				>
					{ this.props.translate( 'Selected start date is later than the end date' ) }
				</Tooltip>
			</div>
		);
	}
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( PostTypeOptions ) );
