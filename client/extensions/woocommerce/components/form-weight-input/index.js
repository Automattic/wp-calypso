/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getWeightUnitSetting } from 'woocommerce/state/sites/settings/products/selectors';
import { fetchSettingsProducts } from 'woocommerce/state/sites/settings/products/actions';

class FormWeightInput extends Component {
	static propTypes = {
		className: PropTypes.string,
		value: PropTypes.string.isRequired,
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

	UNSAFE_componentWillReceiveProps( newProps ) {
		if ( newProps.siteId !== this.props.siteId ) {
			this.props.fetchSettingsProducts( newProps.siteId );
		}
	}

	render() {
		const { className, weightUnit, value, onChange, noWrap } = this.props;
		const classes = classNames( 'form-weight-input', className, { 'no-wrap': noWrap } );

		return (
			<FormTextInputWithAffixes
				noWrap
				name="weight"
				min="0"
				suffix={ weightUnit }
				type="number"
				value={ value || '' }
				onChange={ onChange }
				className={ classes }
				size="4"
			/>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const weightUnitSetting = site && getWeightUnitSetting( state, site.ID );
	const weightUnit = ( weightUnitSetting && weightUnitSetting.value ) || 'lbs';

	return {
		siteId: site && site.ID,
		weightUnit,
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

export default connect( mapStateToProps, mapDispatchToProps )( FormWeightInput );
