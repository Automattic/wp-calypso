/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { isBoolean } from 'lodash';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormToggle from 'calypso/components/forms/form-toggle';
import LabelSettings from './label-settings';
import QueryLabelSettings from 'woocommerce/woocommerce-services/components/query-label-settings';
import { setFormDataValue, restorePristineSettings } from '../../state/label-settings/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	areLabelsEnabled,
	areSettingsErrored,
	userCanEditSettings,
	userCanManagePayments,
	getLabelSettingsFormMeta,
} from '../../state/label-settings/selectors';

class AccountSettingsRootView extends Component {
	componentWillUnmount() {
		this.props.restorePristineSettings( this.props.siteId );
	}

	setValue = ( key, value ) => {
		this.props.onChange();
		this.props.setFormDataValue( this.props.siteId, key, value );
	};

	onEnabledToggle = () => {
		this.props.onChange();
		this.props.setFormDataValue( this.props.siteId, 'enabled', ! this.props.labelsEnabled );
	};

	renderContent = () => {
		const { isFetchError, siteId, translate } = this.props;

		if ( isFetchError ) {
			return (
				<p>{ translate( 'Unable to get your settings. Please refresh the page to try again.' ) }</p>
			);
		}

		return <LabelSettings siteId={ siteId } setValue={ this.setValue } />;
	};

	render() {
		const {
			formMeta,
			canManagePayments,
			canEditSettings,
			labelsEnabled,
			siteId,
			translate,
		} = this.props;

		if ( ! formMeta ) {
			return <QueryLabelSettings siteId={ siteId } />;
		}

		//hide the toggle when the enabled flag is not present (older version of WCS) and respect the setting otherwise.
		const renderToggle = isBoolean( labelsEnabled );
		const hidden = isBoolean( labelsEnabled ) && ! labelsEnabled;

		return (
			<div>
				<QueryLabelSettings siteId={ siteId } />
				<ExtendedHeader
					label={ translate( 'Shipping labels' ) }
					description={ translate(
						'Print shipping labels yourself and save a trip to the post office.'
					) }
				>
					{ renderToggle && (
						<FormToggle
							checked={ labelsEnabled }
							onChange={ this.onEnabledToggle }
							disabled={ Boolean( ! canManagePayments && ! canEditSettings ) }
						/>
					) }
				</ExtendedHeader>
				<Card className={ classNames( 'label-settings__labels-container', { hidden } ) }>
					{ this.renderContent() }
				</Card>
			</div>
		);
	}
}

AccountSettingsRootView.propTypes = {
	onChange: PropTypes.func.isRequired,
	submit: PropTypes.func,
};

function mapStateToProps( state ) {
	return {
		siteId: getSelectedSiteId( state ),
		formMeta: getLabelSettingsFormMeta( state ),
		labelsEnabled: areLabelsEnabled( state ),
		isFetchError: areSettingsErrored( state ),
		canManagePayments: userCanManagePayments( state ),
		canEditSettings: userCanEditSettings( state ),
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			setFormDataValue,
			restorePristineSettings,
		},
		dispatch
	);
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( AccountSettingsRootView ) );
