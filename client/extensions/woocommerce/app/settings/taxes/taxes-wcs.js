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
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import TaxSettingsSaveButton from './save-button';
import SettingsNavigation from '../navigation';
import { successNotice, errorNotice } from 'state/notices/actions';
import StoreAddress from 'woocommerce/components/store-address';
import TaxesOptions from './taxes-options';
import TaxesRates from './taxes-rates';

class SettingsTaxesWooCommerceServices extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			isSaving: false,
			pricesIncludeTaxes: props.pricesIncludeTaxes,
			shippingIsTaxable: props.shippingIsTaxable,
			taxesEnabled: props.taxesEnabled,
			userBeganEditing: false,
		};
	}

	static propTypes = {
		site: PropTypes.shape( {
			slug: PropTypes.string,
			ID: PropTypes.number,
		} ),
		className: PropTypes.string,
	};

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchTaxSettings( site.ID );
		}
	};

	componentWillReceiveProps = newProps => {
		if ( ! this.state.userBeganEditing ) {
			const { site } = this.props;
			const newSiteId = ( newProps.site && newProps.site.ID ) || null;
			const oldSiteId = ( site && site.ID ) || null;
			if ( oldSiteId !== newSiteId ) {
				this.props.fetchTaxSettings( newSiteId );
			}

			this.setState( {
				pricesIncludeTaxes: newProps.pricesIncludeTaxes,
				shippingIsTaxable: newProps.shippingIsTaxable,
				taxesEnabled: newProps.taxesEnabled,
			} );
		}
	};

	onEnabledChange = () => {
		this.setState( { taxesEnabled: ! this.state.taxesEnabled, userBeganEditing: true } );
	};

	onCheckboxChange = event => {
		const option = event.target.name;
		const value = event.target.checked;
		this.setState( { [ option ]: value, userBeganEditing: true } );
	};

	pageHasChanges = () => {
		return this.state.userBeganEditing;
	};

	onSave = ( event, onSuccessExtra ) => {
		const { site, translate } = this.props;

		event.preventDefault();
		this.setState( { isSaving: true } );

		const onSuccess = () => {
			this.setState( { isSaving: false, userBeganEditing: false } );
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

		// TODO - chain these

		this.props.updateTaxesEnabledSetting( site.ID, this.state.taxesEnabled );

		this.props.updateTaxSettings(
			site.ID,
			this.state.pricesIncludeTaxes || false,
			! this.state.shippingIsTaxable, // note the inversion
			onSuccess,
			onFailure
		);
	};

	onAddressChange = address => {
		const { site } = this.props;
		this.props.fetchTaxRates( site.ID, address, true );
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
		const { site } = this.props;

		return (
			<TaxesRates
				taxesEnabled={ this.state.taxesEnabled }
				onEnabledChange={ this.onEnabledChange }
				site={ site }
			/>
		);
	};

	renderOptions = () => {
		return (
			<TaxesOptions
				onCheckboxChange={ this.onCheckboxChange }
				pricesIncludeTaxes={ this.state.pricesIncludeTaxes }
				shippingIsTaxable={ this.state.shippingIsTaxable }
			/>
		);
	};

	render = () => {
		const { className, loaded, site, translate } = this.props;

		const breadcrumbs = [
			<a href={ getLink( '/store/settings/:site/', site ) }>{ translate( 'Settings' ) }</a>,
			<span>{ translate( 'Taxes' ) }</span>,
		];

		return (
			<Main className={ classNames( 'settings-taxes', className ) }>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<TaxSettingsSaveButton onSave={ this.onSave } />
				</ActionHeader>
				<SettingsNavigation activeSection="taxes" />
				<QuerySettingsGeneral siteId={ site.ID } />
				{ loaded && this.renderAddress() }
				{ loaded && this.renderRates() }
				{ loaded && this.renderOptions() }
			</Main>
		);
	};
}

function mapStateToProps( state ) {
	const loaded = areTaxSettingsLoaded( state ) && areSettingsGeneralLoaded( state );
	const site = getSelectedSiteWithFallback( state );
	const pricesIncludeTaxes = getPricesIncludeTax( state );
	const shippingIsTaxable = ! getShippingIsTaxFree( state ); // note the inversion
	const taxesEnabled = areTaxCalculationsEnabled( state );

	return {
		loaded,
		pricesIncludeTaxes,
		shippingIsTaxable,
		site,
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
