/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { difference } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { editPromotion, clearPromotionEdits } from 'woocommerce/state/ui/promotions/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { fetchProductCategories } from 'woocommerce/state/sites/product-categories/actions';
import { fetchPromotions, createPromotion } from 'woocommerce/state/sites/promotions/actions';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
import { areProductsLoading, getAllProducts } from 'woocommerce/state/sites/products/selectors';
import {
	getCurrentlyEditingPromotionId,
	getPromotionEdits,
	getPromotionWithLocalEdits,
} from 'woocommerce/state/selectors/promotions';
import { getSaveErrorMessage } from './save-error-message';
import PromotionHeader from './promotion-header';
import PromotionForm from './promotion-form';
import { ProtectFormGuard } from 'lib/protect-form';
import { recordTrack } from 'woocommerce/lib/analytics';
import { successNotice, errorNotice } from 'state/notices/actions';
import { validateAll } from './promotion-models';

class PromotionCreate extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		currency: PropTypes.string,
		hasEdits: PropTypes.bool.isRequired,
		site: PropTypes.shape( {
			ID: PropTypes.number,
			slug: PropTypes.string,
		} ),
		promotion: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		editPromotion: PropTypes.func.isRequired,
		clearPromotionEdits: PropTypes.func.isRequired,
		createPromotion: PropTypes.func.isRequired,
		fetchProductCategories: PropTypes.func.isRequired,
		fetchPromotions: PropTypes.func.isRequired,
		fetchSettingsGeneral: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			busy: false,
			saveAttempted: false,
		};
	}

	componentDidMount() {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchProductCategories( site.ID, { offset: 0 } );
			this.props.fetchPromotions( site.ID );
			this.props.fetchSettingsGeneral( site.ID );
		}
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.fetchProductCategories( newSiteId, { offset: 0 } );
			this.props.fetchPromotions( newSiteId );
			this.props.fetchSettingsGeneral( newSiteId );
		}

		// Track user starting to edit this promotion.
		if ( ! this.props.hasEdits && newProps.hasEdits ) {
			const editedFields = difference( Object.keys( newProps.promotion ), [
				'id',
				'name',
				'type',
			] );
			const initial_field = 1 === editedFields.length ? editedFields[ 0 ] : 'multiple';

			recordTrack( 'calypso_woocommerce_promotion_new_edit_start', { initial_field } );
		}
	}

	componentWillUnmount() {
		const { site } = this.props;
		if ( site ) {
			this.props.clearPromotionEdits( site.ID );
		}
	}

	onSave = () => {
		const { site, promotion, currency, translate } = this.props;
		const validatingPromotion = promotion || { type: 'fixed_product' };
		const errors = validateAll( validatingPromotion, currency, true );

		if ( errors ) {
			this.setState( () => ( { busy: false, saveAttempted: true } ) );
			this.props.errorNotice(
				translate(
					'There is missing or invalid information. Please correct the highlighted fields and try again.'
				),
				{
					duration: 8000,
				}
			);
			return;
		}

		this.setState( () => ( { busy: true, saveAttempted: true } ) );

		const getSuccessNotice = () => {
			return successNotice(
				translate( 'Promotion successfully created.', {
					args: { promotion: promotion.name },
				} ),
				{
					displayOnNextPage: true,
					duration: 8000,
				}
			);
		};

		const successAction = ( dispatch ) => {
			this.props.clearPromotionEdits( site.ID );

			dispatch( getSuccessNotice( promotion ) );
			page.redirect( getLink( '/store/promotions/:site', site ) );
		};

		const failureAction = ( error ) => {
			this.setState( () => ( { busy: false } ) );
			const errorSlug = ( error && error.error ) || undefined;

			return errorNotice( getSaveErrorMessage( errorSlug, promotion.name, translate ), {
				duration: 8000,
			} );
		};

		this.props.createPromotion( site.ID, promotion, successAction, failureAction );

		recordTrack( 'calypso_woocommerce_promotion_create', {
			type: promotion.type,
			sale_price: promotion.salePrice,
			percent_discount: promotion.percentDiscount,
			fixed_discount: promotion.fixedDiscount,
			start_date: promotion.startDate,
			end_date: promotion.endDate,
		} );
	};

	render() {
		const { site, currency, className, promotion, hasEdits, products } = this.props;
		const { saveAttempted, busy } = this.state;

		return (
			<Main className={ className } wideLayout>
				<PromotionHeader
					site={ site }
					promotion={ promotion }
					onSave={ this.onSave }
					isBusy={ busy }
				/>
				<ProtectFormGuard isChanged={ hasEdits } />
				<PromotionForm
					siteId={ site && site.ID }
					currency={ currency }
					promotion={ promotion }
					editPromotion={ this.props.editPromotion }
					products={ products }
					showEmptyValidationErrors={ saveAttempted }
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
	const hasEdits = Boolean( getPromotionEdits( state, promotionId, site.ID ) );
	const productsLoading = areProductsLoading( state, site.ID );
	const products = productsLoading ? null : getAllProducts( state, site.ID );

	return {
		hasEdits,
		site,
		promotion,
		currency,
		products,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editPromotion,
			errorNotice,
			clearPromotionEdits,
			createPromotion,
			fetchProductCategories,
			fetchPromotions,
			fetchSettingsGeneral,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( PromotionCreate ) );
