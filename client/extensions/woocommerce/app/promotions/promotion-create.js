/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { editPromotion, clearPromotionEdits } from 'woocommerce/state/ui/promotions/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { fetchProductCategories } from 'woocommerce/state/sites/product-categories/actions';
import { fetchPromotions } from 'woocommerce/state/sites/promotions/actions';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
import {
	getCurrentlyEditingPromotionId,
	getPromotionWithLocalEdits,
} from 'woocommerce/state/selectors/promotions';
import PromotionHeader from './promotion-header';
import PromotionForm from './promotion-form';

class PromotionCreate extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		site: PropTypes.shape( {
			ID: PropTypes.number,
			slug: PropTypes.string,
		} ),
		promotion: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		editPromotion: PropTypes.func.isRequired,
		clearPromotionEdits: PropTypes.func.isRequired,
		fetchProductCategories: PropTypes.func.isRequired,
		fetchPromotions: PropTypes.func.isRequired,
		fetchSettingsGeneral: PropTypes.func.isRequired,
	};

	componentDidMount() {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchProductCategories( site.ID );
			this.props.fetchPromotions( site.ID );
			this.props.fetchSettingsGeneral( site.ID );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.fetchProductCategories( newSiteId );
			this.props.fetchPromotions( newSiteId );
			this.props.fetchSettingsGeneral( newSiteId );
		}
	}

	componentWillUnmount() {
		const { site } = this.props;
		if ( site ) {
			this.props.clearPromotionEdits( site.ID );
		}
	}

	onSave = () => {
		// TODO: Add action to save promotion.
	};

	isPromotionValid() {
		const { promotion } = this.props;

		// TODO: Update with real info.
		return promotion && promotion.id;
	}

	render() {
		const { site, currency, className, promotion } = this.props;

		// TODO: Update with real info.
		const isValid = 'undefined' !== typeof site && this.isPromotionValid();
		const isBusy = false;
		const saveEnabled = isValid && ! isBusy;

		return (
			<Main className={ className }>
				<PromotionHeader
					site={ site }
					promotion={ promotion }
					onSave={ saveEnabled ? this.onSave : false }
					isBusy={ isBusy }
				/>
				<PromotionForm
					siteId={ site && site.ID }
					currency={ currency }
					promotion={ promotion }
					editPromotion={ this.props.editPromotion }
				/>
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const currencySettings = getPaymentCurrencySettings( state );
	const currency = currencySettings ? currencySettings.value : null;
	const promotionId = getCurrentlyEditingPromotionId( state, site.ID );
	const promotion = promotionId ? getPromotionWithLocalEdits( state, promotionId, site.ID ) : null;

	return {
		site,
		promotion,
		currency,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editPromotion,
			clearPromotionEdits,
			fetchProductCategories,
			fetchPromotions,
			fetchSettingsGeneral,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( PromotionCreate ) );
