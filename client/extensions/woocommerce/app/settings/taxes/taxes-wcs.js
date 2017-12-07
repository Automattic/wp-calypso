/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEqual, pick } from 'lodash';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import {
	areSettingsGeneralLoaded,
	areTaxCalculationsEnabled,
} from 'woocommerce/state/sites/settings/general/selectors';
import {
	areTaxSettingsLoaded,
	getPricesIncludeTax,
	getShippingIsTaxFree,
} from 'woocommerce/state/sites/settings/tax/selectors';
import ExtendedHeader from 'woocommerce/components/extended-header';
import { updateTaxesEnabledSetting } from 'woocommerce/state/sites/settings/general/actions';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import { fetchTaxRates } from 'woocommerce/state/sites/meta/taxrates/actions';
import { fetchTaxSettings, updateTaxSettings } from 'woocommerce/state/sites/settings/tax/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import Main from 'components/main';
import { ProtectFormGuard } from 'lib/protect-form';
import SettingsNavigation from '../navigation';
import { successNotice, errorNotice } from 'state/notices/actions';
import StoreAddress from 'woocommerce/components/store-address';
import TaxesOptions from './taxes-options';
import TaxesRates from './taxes-rates';
import TaxSettingsSaveButton from './save-button';

const boundSettingsKeys = [ 'pricesIncludeTaxes', 'shippingIsTaxable', 'taxesEnabled' ];

class SettingsTaxesWooCommerceServices extends Component {
	constructor( props ) {
		super( props );
		const initialSettings = pick( props, boundSettingsKeys );
		this.state = {
			isSaving: false,
			initialSettings,
			boundSettings: initialSettings,
		};
	}

	static propTypes = {
		className: PropTypes.string,
		loaded: PropTypes.bool,
		pricesIncludeTaxes: PropTypes.bool,
		shippingIsTaxable: PropTypes.bool,
		siteSlug: PropTypes.string.isRequired,
		siteId: PropTypes.number.isRequired,
		taxesEnabled: PropTypes.bool,
	};

	componentDidMount = () => {
		const { siteId } = this.props;

		if ( siteId ) {
			this.props.fetchTaxSettings( siteId );
		}
	};

	componentWillReceiveProps = newProps => {
		const { siteId } = this.props;
		const newSiteId = newProps.siteId || null;
		const oldSiteId = siteId || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.fetchTaxSettings( newSiteId );
		}

		const initialSettings = pick( newProps, boundSettingsKeys );
		this.setState( {
			initialSettings,
			boundSettings: initialSettings,
		} );
	};

	hasEdits = () => {
		return ! isEqual( this.state.initialSettings, this.state.boundSettings );
	};

	onEnabledChange = () => {
		const boundSettings = Object.assign( {}, this.state.boundSettings, {
			taxesEnabled: ! this.state.boundSettings.taxesEnabled,
		} );
		this.setState( { boundSettings } );
	};

	onCheckboxChange = event => {
		const option = event.target.name;
		const value = event.target.checked;
		const boundSettings = Object.assign( {}, this.state.boundSettings, { [ option ]: value } );
		this.setState( { boundSettings } );
	};

	onSave = ( event, onSuccessExtra ) => {
		const { siteId, translate } = this.props;

		event.preventDefault();
		this.setState( { isSaving: true } );

		const onSuccess = () => {
			this.setState( { initialSettings: this.state.boundSettings, isSaving: false } );
			if ( onSuccessExtra ) {
				onSuccessExtra();
			}
			return successNotice( translate( 'Settings updated successfully.' ), {
				duration: 4000,
				displayOnNextPage: true,
			} );
		};

		const onFailure = () => {
			this.setState( { isSaving: false } );
			return errorNotice(
				translate( 'There was a problem saving your changes. Please try again.' )
			);
		};

		this.props.updateTaxesEnabledSetting( siteId, this.state.boundSettings.taxesEnabled );

		this.props.updateTaxSettings(
			siteId,
			this.state.boundSettings.pricesIncludeTaxes || false,
			! this.state.boundSettings.shippingIsTaxable, // note the inversion
			onSuccess,
			onFailure
		);
	};

	onAddressChange = address => {
		const { siteId } = this.props;
		this.props.fetchTaxRates( siteId, address, true );
	};

	renderAddress = () => {
		const { translate } = this.props;

		return (
			<div className="taxes__nexus">
				<ExtendedHeader
					label={ translate( 'Store Address' ) }
					description={ translate(
						'The address of where your business is located for tax purposes.'
					) }
				/>
				<StoreAddress
					className="taxes__store-address"
					onSetAddress={ this.onAddressChange }
					showLabel={ false }
				/>
			</div>
		);
	};

	renderRates = () => {
		const { siteId } = this.props;

		return (
			<TaxesRates
				taxesEnabled={ this.state.boundSettings.taxesEnabled }
				onEnabledChange={ this.onEnabledChange }
				siteId={ siteId }
			/>
		);
	};

	renderOptions = () => {
		return (
			<TaxesOptions
				onCheckboxChange={ this.onCheckboxChange }
				pricesIncludeTaxes={ this.state.boundSettings.pricesIncludeTaxes }
				shippingIsTaxable={ this.state.boundSettings.shippingIsTaxable }
			/>
		);
	};

	render = () => {
		const { className, loaded, siteId, siteSlug, translate } = this.props;

		const breadcrumbs = [
			<a href={ getLink( '/store/settings/:site/', { slug: siteSlug } ) }>
				{ translate( 'Settings' ) }
			</a>,
			<span>{ translate( 'Taxes' ) }</span>,
		];

		const hasEdits = this.hasEdits();

		return (
			<Main className={ classNames( 'settings-taxes', className ) } wideLayout>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<TaxSettingsSaveButton onSave={ this.onSave } />
				</ActionHeader>
				<SettingsNavigation activeSection="taxes" />
				<QuerySettingsGeneral siteId={ siteId } />
				{ loaded && this.renderAddress() }
				{ loaded && this.renderRates() }
				{ loaded && this.renderOptions() }
				<ProtectFormGuard isChanged={ hasEdits } />
			</Main>
		);
	};
}

function mapStateToProps( state ) {
	const loaded = areTaxSettingsLoaded( state ) && areSettingsGeneralLoaded( state );
	const pricesIncludeTaxes = getPricesIncludeTax( state );
	const shippingIsTaxable = ! getShippingIsTaxFree( state ); // note the inversion
	const taxesEnabled = areTaxCalculationsEnabled( state );

	return {
		loaded,
		pricesIncludeTaxes,
		shippingIsTaxable,
		taxesEnabled,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchTaxRates,
			fetchTaxSettings,
			updateTaxesEnabledSetting,
			updateTaxSettings,
		},
		dispatch
	);
}
export default connect( mapStateToProps, mapDispatchToProps )(
	localize( SettingsTaxesWooCommerceServices )
);
