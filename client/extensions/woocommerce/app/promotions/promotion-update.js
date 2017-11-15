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
import page from 'page';
import { debounce } from 'lodash';

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
import {
	getPromotionEdits,
	getPromotionWithLocalEdits,
	getPromotionableProducts,
} from 'woocommerce/state/selectors/promotions';
import { isValidPromotion } from './helpers';
import PromotionHeader from './promotion-header';
import PromotionForm from './promotion-form';
import { ProtectFormGuard } from 'lib/protect-form';

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
		};
	}

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
		} );
	};

	onSave = () => {
		const { site, promotion, translate } = this.props;

		this.setState( () => ( { busy: true } ) );

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
			this.setState( () => ( { busy: false } ) );
		};

		const failureAction = dispatch => {
			dispatch(
				errorNotice(
					translate( 'There was a problem saving the %(promotion)s promotion. Please try again.', {
						args: { promotion: promotion.name },
					} )
				)
			);
			this.setState( () => ( { busy: false } ) );
		};

		this.props.updatePromotion( site.ID, promotion, successAction, failureAction );
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
		const { busy } = this.state;

		const isValid = 'undefined' !== typeof site && isValidPromotion( promotion );
		const saveEnabled = isValid && ! busy && hasEdits;

		return (
			<Main className={ className }>
				<PromotionHeader
					site={ site }
					promotion={ promotion }
					onTrash={ this.onTrash }
					onSave={ saveEnabled ? this.onSave : false }
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
				/>
			</Main>
		);
	}
}

function mapStateToProps( state, ownProps ) {
	const site = getSelectedSiteWithFallback( state );
	const currencySettings = getPaymentCurrencySettings( state );
	const currency = currencySettings ? currencySettings.value : null;
	const promotionId = ownProps.params.promotion;
	const promotion = promotionId ? getPromotionWithLocalEdits( state, promotionId, site.ID ) : null;
	const products = getPromotionableProducts( state, site.ID );
	const productCategories = getProductCategories( state, site.ID );
	const hasEdits = Boolean( getPromotionEdits( state, promotionId, site.ID ) );

	return {
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
