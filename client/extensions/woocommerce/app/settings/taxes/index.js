/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import TaxesNexus from './taxes-nexus';
import TaxesOptions from './taxes-options';
import TaxesRates from './taxes-rates';

class SettingsTaxes extends Component {

	static propTypes = {
		site: PropTypes.shape( {
			slug: PropTypes.string,
		} ),
		className: PropTypes.string,
	};

	componentWillReceiveProps = ( /* newProps */ ) => {
		// Load local state from the props (if they changed)
		// TODO - woocommerce_prices_include_tax - should always be "no" (the default) for US + CA
		// TODO - woocommerce_shipping_tax_class - should be either "standard?" (15795) or "zero-rate"
	}

	onOptionsChange = ( /* event */ ) => {
		// save changes to local state
	}

	pageHasChanges = () => {
		// Check for mismatch between redux state and local state
		return false;
	}

	onSave = ( /* event */ ) => {
		// TODO - persist changes to the server
	}

	render = () => {
		const { site, translate, className } = this.props;

		const breadcrumbs = [
			( <a href={ getLink( '/store/:site/', site ) }>{ translate( 'Settings' ) }</a> ),
			( <span>{ translate( 'Taxes' ) }</span> ),
		];

		if ( ! site ) {
			// TODO placeholder
			return null;
		}

		const saveButtonDisabled = ! this.pageHasChanges();

		return (
			<Main className={ classNames( 'settings-taxes', className ) }>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<Button disabled={ saveButtonDisabled } primary >
						{ translate( 'Save' ) }
					</Button>
				</ActionHeader>
				<TaxesNexus site={ site } />
				<TaxesRates site={ site } />
				<TaxesOptions onChange={ this.onOptionsChange } site={ site } />
			</Main>
		);
	}

}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	return {
		site,
	};
}

export default connect( mapStateToProps )( localize( SettingsTaxes ) );
