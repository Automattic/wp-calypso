/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import SettingsNavigation from '../navigation';
import TaxSettingsSaveButton from './save-button';
import TaxesOptions from './taxes-options';
import TaxesRates from './taxes-rates';
import Main from 'components/main';
import { successNotice, errorNotice } from 'state/notices/actions';
import ActionHeader from 'woocommerce/components/action-header';
import ExtendedHeader from 'woocommerce/components/extended-header';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import StoreAddress from 'woocommerce/components/store-address';
import { getLink } from 'woocommerce/lib/nav-utils';
import { fetchTaxRates } from 'woocommerce/state/sites/meta/taxrates/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { updateTaxesEnabledSetting } from 'woocommerce/state/sites/settings/general/actions';
import { areSettingsGeneralLoaded, areTaxCalculationsEnabled } from 'woocommerce/state/sites/settings/general/selectors';
import { fetchTaxSettings, updateTaxSettings } from 'woocommerce/state/sites/settings/tax/actions';
import { areTaxSettingsLoaded, getPricesIncludeTax, getShippingIsTaxFree } from 'woocommerce/state/sites/settings/tax/selectors';

class SettingsTaxes extends Component {
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
		} ),
		className: PropTypes.string,
	};

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchTaxSettings( site.ID );
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		if ( ! this.state.userBeganEditing ) {
			const { site } = this.props;
			const newSiteId = newProps.site && newProps.site.ID || null;
			const oldSiteId = site && site.ID || null;
			if ( oldSiteId !== newSiteId ) {
				this.props.fetchTaxSettings( newSiteId );
			}

			this.setState( {
				pricesIncludeTaxes: newProps.pricesIncludeTaxes,
				shippingIsTaxable: newProps.shippingIsTaxable,
				taxesEnabled: newProps.taxesEnabled,
			} );
		}
	}

	onEnabledChange = () => {
		this.setState( { taxesEnabled: ! this.state.taxesEnabled, userBeganEditing: true } );
	}

	onCheckboxChange = ( event ) => {
		const option = event.target.name;
		const value = event.target.checked;
		this.setState( { [ option ]: value, userBeganEditing: true } );
	}

	pageHasChanges = () => {
		return this.state.userBeganEditing;
	}

	onSave = ( event, onSuccessExtra ) => {
		const { site, translate } = this.props;

		event.preventDefault();
		this.setState( { isSaving: true } );

		const onSuccess = () => {
			this.setState( { isSaving: false, userBeganEditing: false } );
			if ( onSuccessExtra ) {
				onSuccessExtra();
			}
			return successNotice( translate( 'Settings updated successfully.' ), { duration: 4000, displayOnNextPage: true } );
		};

		const onFailure = () => {
			this.setState( { isSaving: false } );
			return errorNotice( translate( 'There was a problem saving your changes. Please try again.' ) );
		};

		// TODO - chain these

		this.props.updateTaxesEnabledSetting(
			site.ID,
			this.state.taxesEnabled,
		);

		this.props.updateTaxSettings(
			site.ID,
			this.state.pricesIncludeTaxes || false,
			! this.state.shippingIsTaxable, // note the inversion
			onSuccess,
			onFailure
		);
	};

	onAddressChange = ( address ) => {
		const { site } = this.props;
		this.props.fetchTaxRates( site.ID, address, true );
	};

	render = () => {
		const { className, loaded, site, translate } = this.props;

		if ( ! loaded ) {
			// TODO placeholder
			return <QuerySettingsGeneral siteId={ site.ID } />;
		}

		const breadcrumbs = [
			( <a href={ getLink( '/store/:site/', site ) }>{ translate( 'Settings' ) }</a> ),
			( <span>{ translate( 'Taxes' ) }</span> ),
		];

		return (
			<Main className={ classNames( 'settings-taxes', className ) }>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<TaxSettingsSaveButton onSave={ this.onSave } />
				</ActionHeader>
				<SettingsNavigation activeSection="taxes" />
				<div className="taxes__nexus">
					<ExtendedHeader
						label={ translate( 'Store Address' ) }
						description={ translate( 'The address of where your business is located for tax purposes.' ) } />
					<StoreAddress className="taxes__store-address" onSetAddress={ this.onAddressChange } showLabel={ false } />
				</div>
				<TaxesRates
					taxesEnabled={ this.state.taxesEnabled }
					onEnabledChange={ this.onEnabledChange }
					site={ site }
				/>
				<TaxesOptions
					onCheckboxChange={ this.onCheckboxChange }
					pricesIncludeTaxes={ this.state.pricesIncludeTaxes }
					shippingIsTaxable={ this.state.shippingIsTaxable }
				/>
			</Main>
		);
	}

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
			updateTaxSettings
		},
		dispatch
	);
}
export default connect( mapStateToProps, mapDispatchToProps )( localize( SettingsTaxes ) );
