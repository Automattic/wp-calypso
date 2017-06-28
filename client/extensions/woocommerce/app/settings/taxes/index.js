/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import {
	areSettingsGeneralLoading,
	areTaxCalculationsEnabled,
} from 'woocommerce/state/sites/settings/general/selectors';
import {
	areTaxSettingsLoading,
	getPricesIncludeTax,
	getShippingIsTaxFree,
} from 'woocommerce/state/sites/settings/tax/selectors';
import Button from 'components/button';
import ExtendedHeader from 'woocommerce/components/extended-header';
import {
	fetchSettingsGeneral,
	updateTaxesEnabledSetting,
} from 'woocommerce/state/sites/settings/general/actions';
import {
	fetchTaxSettings,
	updateTaxSettings,
} from 'woocommerce/state/sites/settings/tax/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import { successNotice, errorNotice } from 'state/notices/actions';
import StoreAddress from 'woocommerce/components/store-address';
import TaxesOptions from './taxes-options';
import TaxesRates from './taxes-rates';

class SettingsTaxes extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			isSaving: false,
			pricesIncludeTaxes: true,
			shippingIsTaxable: true,
			taxesEnabled: true,
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
			this.props.fetchSettingsGeneral( site.ID );
			this.props.fetchTaxSettings( site.ID );
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		if ( ! this.state.userBeganEditing ) {
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

	onSave = ( event ) => {
		const { site, translate } = this.props;

		event.preventDefault();
		this.setState( { isSaving: true } );

		const onSuccess = () => {
			this.setState( { isSaving: false, userBeganEditing: false } );
			return successNotice( translate( 'Settings updated successfully.' ) );
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
			this.state.pricesIncludeTax,
			! this.state.shippingIsTaxable, // note the inversion
			onSuccess,
			onFailure
		);
	};

	render = () => {
		const { className, loading, site, translate } = this.props;

		if ( loading ) {
			// TODO placeholder
			return null;
		}

		const breadcrumbs = [
			( <a href={ getLink( '/store/:site/', site ) }>{ translate( 'Settings' ) }</a> ),
			( <span>{ translate( 'Taxes' ) }</span> ),
		];

		const saveButtonDisabled = this.state.isSaving || ! this.pageHasChanges();

		return (
			<Main className={ classNames( 'settings-taxes', className ) }>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<Button disabled={ saveButtonDisabled } onClick={ this.onSave } primary>
						{ translate( 'Save' ) }
					</Button>
				</ActionHeader>
				<div className="taxes__nexus">
					<ExtendedHeader
						label={ translate( 'Store Address / Tax Nexus' ) }
						description={ translate( 'The address of where your business is located for tax purposes.' ) } />
					<StoreAddress className="taxes__store-address" />
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
	let loading = true;
	let pricesIncludeTaxes = false;
	let shippingIsTaxable = false;
	let taxesEnabled = false;

	const site = getSelectedSiteWithFallback( state );
	if ( site ) {
		loading = areTaxSettingsLoading( state, site.ID ) || areSettingsGeneralLoading( state, site.ID );
		if ( ! loading ) {
			pricesIncludeTaxes = getPricesIncludeTax( state, site.ID );
			shippingIsTaxable = ! getShippingIsTaxFree( state, site.ID ); // note the inversion
			taxesEnabled = areTaxCalculationsEnabled( state, site.ID );
		}
	}

	return {
		loading,
		pricesIncludeTaxes,
		shippingIsTaxable,
		site,
		taxesEnabled,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSettingsGeneral,
			fetchTaxSettings,
			updateTaxesEnabledSetting,
			updateTaxSettings
		},
		dispatch
	);
}
export default connect( mapStateToProps, mapDispatchToProps )( localize( SettingsTaxes ) );
