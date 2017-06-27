/**
 * External dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:allendav' );

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
	areTaxCalculationsEnabled
} from 'woocommerce/state/sites/settings/general/selectors';
import {
	areTaxSettingsLoading,
	getPricesIncludeTax,
	getShippingIsTaxFree
} from 'woocommerce/state/sites/settings/tax/selectors';
import Button from 'components/button';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import { fetchTaxSettings } from 'woocommerce/state/sites/settings/tax/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import TaxesNexus from './taxes-nexus';
import TaxesOptions from './taxes-options';
import TaxesRates from './taxes-rates';

class SettingsTaxes extends Component {
	constructor( props ) {
		super( props );
		this.state = {
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
		if ( this.state.pricesIncludeTaxes !== this.props.pricesIncludeTaxes ) {
			return true;
		}
		if ( this.state.shippingIsTaxable !== this.props.shippingIsTaxable ) {
			return true;
		}
		if ( this.state.taxesEnabled !== this.props.taxesEnabled ) {
			return true;
		}
		return false;
	}

	onSave = ( /* event */ ) => {
		// TODO - persist changes to the server
	}

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

		debug( 'in render, props=', this.props );

		const saveButtonDisabled = ! this.pageHasChanges();

		return (
			<Main className={ classNames( 'settings-taxes', className ) }>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<Button disabled={ saveButtonDisabled } primary >
						{ translate( 'Save' ) }
					</Button>
				</ActionHeader>
				<TaxesNexus
					site={ site }
				/>
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
			fetchTaxSettings
		},
		dispatch
	);
}
export default connect( mapStateToProps, mapDispatchToProps )( localize( SettingsTaxes ) );
