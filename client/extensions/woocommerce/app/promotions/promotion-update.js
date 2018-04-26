/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { difference, debounce } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import accept from 'lib/accept';
import { successNotice, errorNotice } from 'state/notices/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import {
	fetchPromotions,
	updatePromotion,
	deletePromotion,
} from 'woocommerce/state/sites/promotions/actions';
import { fetchProductCategories } from 'woocommerce/state/sites/product-categories/actions';
import { getProductCategories } from 'woocommerce/state/sites/product-categories/selectors';
import { editPromotion, clearPromotionEdits } from 'woocommerce/state/ui/promotions/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
import { areProductsLoading, getAllProducts } from 'woocommerce/state/sites/products/selectors';
import {
	getPromotionEdits,
	getPromotionWithLocalEdits,
} from 'woocommerce/state/selectors/promotions';
import { getSaveErrorMessage } from './save-error-message';
import PromotionHeader from './promotion-header';
import PromotionForm from './promotion-form';
import { ProtectFormGuard } from 'lib/protect-form';
import { recordTrack } from 'woocommerce/lib/analytics';
import { validateAll } from './promotion-models';

class PromotionUpdate extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		currency: PropTypes.string,
		hasEdits: PropTypes.bool.isRequired,
		products: PropTypes.array,
		productCategories: PropTypes.array,
		site: PropTypes.shape( {
			ID: PropTypes.number,
			slug: PropTypes.string,
		} ),
		promotion: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		editPromotion: PropTypes.func.isRequired,
		clearPromotionEdits: PropTypes.func.isRequired,
		fetchSettingsGeneral: PropTypes.func.isRequired,
		fetchPromotions: PropTypes.func.isRequired,
		fetchProductCategories: PropTypes.func.isRequired,
		updatePromotion: PropTypes.func.isRequired,
		deletePromotion: PropTypes.func.isRequired,
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

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.fetchProductCategories( newSiteId, { offset: 0 } );
			this.props.fetchPromotions( newSiteId );
			this.props.fetchSettingsGeneral( newSiteId );
		}

		// Track user starting to edit this promotion.
		if ( ! this.props.edits && newProps.edits ) {
			const editedFields = difference( Object.keys( newProps.edits ), [ 'id', 'name', 'type' ] );
			const initial_field = 1 === editedFields.length ? editedFields[ 0 ] : 'multiple';

			recordTrack( 'calypso_woocommerce_promotion_existing_edit_start', { initial_field } );
		}
	}

	componentWillUnmount() {
		const { site } = this.props;
		if ( site ) {
			this.props.clearPromotionEdits( site.ID );
		}
	}

	onTrash = () => {
		const { translate, site, promotion, deletePromotion: dispatchDelete } = this.props;
		const areYouSure = translate( 'Are you sure you want to permanently delete this promotion?' );
		accept( areYouSure, accepted => {
			if ( ! accepted ) {
				return;
			}

			const successAction = dispatch => {
				this.props.clearPromotionEdits( site.ID );

				dispatch( successNotice( translate( 'Promotion successfully deleted.' ) ) );
				debounce( () => {
					page.redirect( getLink( '/store/promotions/:site/', site ) );
				}, 1000 )();
			};
			const failureAction = () => {
				return errorNotice(
					translate( 'There was a problem deleting the promotion. Please try again.' )
				);
			};
			dispatchDelete( site.ID, promotion, successAction, failureAction );

			recordTrack( 'calypso_woocommerce_promotion_delete', {
				type: promotion.type,
				sale_price: promotion.salePrice,
				percent_discount: promotion.percentDiscount,
				fixed_discount: promotion.fixedDiscount,
				start_date: promotion.startDate,
				end_date: promotion.endDate,
			} );
		} );
	};

	onSave = () => {
		const { site, promotion, edits, currency, translate } = this.props;
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
				translate( '%(promotion)s promotion successfully updated.', {
					args: { promotion: promotion.name },
				} ),
				{
					duration: 8000,
				}
			);
		};

		const successAction = dispatch => {
			this.props.clearPromotionEdits( site.ID );
			dispatch( getSuccessNotice( promotion ) );
			this.setState( () => ( { busy: false, saveAttempted: false } ) );
		};

		const failureAction = error => {
			this.setState( () => ( { busy: false } ) );
			const errorSlug = ( error && error.error ) || undefined;

			return errorNotice( getSaveErrorMessage( errorSlug, promotion.name, translate ), {
				duration: 8000,
			} );
		};

		this.props.updatePromotion( site.ID, promotion, successAction, failureAction );

		const edited_fields = difference( Object.keys( edits || {} ), [ 'id', 'name', 'type' ] ).join();
		recordTrack( 'calypso_woocommerce_promotion_update', {
			edited_fields,
			type: promotion.type,
			sale_price: promotion.salePrice,
			percent_discount: promotion.percentDiscount,
			fixed_discount: promotion.fixedDiscount,
			start_date: promotion.startDate,
			end_date: promotion.endDate,
		} );
	};

	render() {
		const {
			site,
			currency,
			className,
			promotion,
			products,
			productCategories,
			hasEdits,
		} = this.props;
		const { saveAttempted, busy } = this.state;

		return (
			<Main className={ className } wideLayout>
				<PromotionHeader
					site={ site }
					promotion={ promotion }
					onTrash={ this.onTrash }
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
					productCategories={ productCategories }
					showEmptyValidationErrors={ saveAttempted }
				/>
			</Main>
		);
	}
}

function mapStateToProps( state, ownProps ) {
	const site = getSelectedSiteWithFallback( state );
	const currencySettings = getPaymentCurrencySettings( state );
	const currency = currencySettings ? currencySettings.value : null;
	const promotionId = ownProps.params.promotion_id;
	const promotion = promotionId ? getPromotionWithLocalEdits( state, promotionId, site.ID ) : null;
	const productsLoading = areProductsLoading( state, site.ID );
	const products = productsLoading ? null : getAllProducts( state, site.ID );
	const productCategories = getProductCategories( state, {}, site.ID );
	const edits = getPromotionEdits( state, promotionId, site.ID );
	const hasEdits = Boolean( edits );

	return {
		edits,
		hasEdits,
		site,
		promotion,
		currency,
		products,
		productCategories,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editPromotion,
			errorNotice,
			clearPromotionEdits,
			fetchSettingsGeneral,
			fetchPromotions,
			fetchProductCategories,
			updatePromotion,
			deletePromotion,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( PromotionUpdate ) );
