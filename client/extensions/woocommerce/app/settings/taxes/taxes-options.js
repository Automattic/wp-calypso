/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	areSettingsGeneralLoading,
	getStoreLocation
} from 'woocommerce/state/sites/settings/general/selectors';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';

class TaxesOptions extends Component {

	static propTypes = {
		site: PropTypes.shape( {
			slug: PropTypes.string,
		} ),
	};

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchSettingsGeneral( site.ID );
		}
	}

	onChange = ( /* event */ ) => {
	}

	render = () => {
		const { loading, translate } = this.props;

		if ( loading ) {
			return null;
		}

		return (
			<div className="taxes__taxes-options">
				<ExtendedHeader
					label={ translate( 'Tax settings' ) }
					description={ translate( 'Configure how taxes are calculated' ) }
				/>
				<Card>
					<FormFieldset>
						<FormLabel>
							<FormCheckbox checked={ this.props.pricesIncludeTaxes } onChange={ this.onChange } />
								<span>{ translate( 'Taxes are included in product prices' ) }</span>
						</FormLabel>
					</FormFieldset>
					<FormFieldset>
						<FormLabel>
							<FormCheckbox checked={ this.props.shippingIsTaxable } onChange={ this.onChange } />
								<span>{ translate( 'Charge taxes on shipping costs' ) }</span>
						</FormLabel>
					</FormFieldset>
				</Card>
			</div>
		);
	}

}

function mapStateToProps( state ) {
	const address = getStoreLocation( state );
	const loading = areSettingsGeneralLoading( state );
	return {
		address,
		loading,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSettingsGeneral,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( TaxesOptions ) );
