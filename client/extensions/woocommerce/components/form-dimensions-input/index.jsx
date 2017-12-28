/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import FormTextInput from 'client/components/forms/form-text-input';
import FormTextInputWithAffixes from 'client/components/forms/form-text-input-with-affixes';
import { getSelectedSiteWithFallback } from 'client/extensions/woocommerce/state/sites/selectors';
import { getDimensionsUnitSetting } from 'client/extensions/woocommerce/state/sites/settings/products/selectors';
import { fetchSettingsProducts } from 'client/extensions/woocommerce/state/sites/settings/products/actions';

class FormDimensionsInput extends Component {
	static propTypes = {
		className: PropTypes.string,
		dimensions: PropTypes.shape( {
			width: PropTypes.string,
			height: PropTypes.sting,
			length: PropTypes.string,
		} ),
		onChange: PropTypes.func.isRequired,
		noWrap: PropTypes.bool,
	};

	static defaultProps = {
		value: '',
		className: '',
		onChange: noop,
		noWrap: false,
	};

	componentDidMount() {
		const { siteId } = this.props;

		if ( siteId ) {
			this.props.fetchSettingsProducts( siteId );
		}
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.siteId !== this.props.siteId ) {
			this.props.fetchSettingsProducts( newProps.siteId );
		}
	}

	render() {
		const { className, noWrap, dimensions, onChange, translate, dimensionsUnit } = this.props;
		const classes = classNames( 'form-dimensions-input', className, { 'no-wrap': noWrap } );

		return (
			<div className={ classes }>
				<FormTextInput
					name="length"
					placeholder={ translate( 'L', { comment: 'Length placeholder for dimensions input' } ) }
					type="number"
					value={ ( dimensions && dimensions.length ) || '' }
					onChange={ onChange }
					className="form-dimensions-input__length"
				/>
				<FormTextInput
					name="width"
					placeholder={ translate( 'W', { comment: 'Width placeholder for dimensions input' } ) }
					type="number"
					value={ ( dimensions && dimensions.width ) || '' }
					onChange={ onChange }
					className="form-dimensions-input__width"
				/>
				<FormTextInputWithAffixes
					name="height"
					placeholder={ translate( 'H', { comment: 'Height placeholder for dimensions input' } ) }
					suffix={ dimensionsUnit }
					type="number"
					noWrap={ noWrap }
					value={ ( dimensions && dimensions.height ) || '' }
					onChange={ onChange }
					className="form-dimensions-input__height"
				/>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const dimensionsUnitSetting = site && getDimensionsUnitSetting( state, site.ID );
	const dimensionsUnit = ( dimensionsUnitSetting && dimensionsUnitSetting.value ) || 'in';

	return {
		siteId: site && site.ID,
		dimensionsUnit,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSettingsProducts,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( FormDimensionsInput ) );
