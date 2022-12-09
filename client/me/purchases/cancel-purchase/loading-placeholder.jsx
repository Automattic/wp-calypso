import { Button, Gridicon } from '@automattic/components';
import { useTranslate, localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import titles from 'calypso/me/purchases/titles';

import '../components/loading-placeholder/style.scss';

const CancelPurchaseLoadingPlaceholder = ( { purchaseId, siteSlug, getManagePurchaseUrlFor } ) => {
	const translate = useTranslate();
	const title = titles.cancelPurchase;
	const isFullWidth = true;
	let path;

	if ( siteSlug ) {
		path = getManagePurchaseUrlFor( siteSlug, purchaseId );
	}

	function goBack() {
		page.back( path || '/' );
	}

	function supportLink() {
		return translate( 'Have a question? {{contactLink}}Ask a Happiness Engineer!{{/contactLink}}', {
			components: {
				contactLink: <a href={ CALYPSO_CONTACT } />,
			},
		} );
	}

	function siteHeader() {
		return (
			<div className="site">
				<div className="site__content">
					<div className="site-icon is-blank" />
					<div className="site__info">
						<div className="site__title"></div>
						<div className="site__domain"></div>
					</div>
				</div>
			</div>
		);
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace, jsx-a11y/heading-has-content */
	return (
		<Main wideLayout={ isFullWidth } className="loading-placeholder">
			<Button compact borderless className="cancel-purchase__back-link" onClick={ goBack }>
				<Gridicon icon="chevron-left" size={ 18 } />
				{ translate( 'Back' ) }
			</Button>

			<FormattedHeader
				className="cancel-purchase__formatter-header"
				brandFont
				headerText={ title }
				align="left"
			/>

			<div className="cancel-purchase__layout">
				<div className="cancel-purchase__layout-col cancel-purchase__layout-col-left">
					<div className="loading-placeholder__content cancel-purchase-loading-placeholder__site">
						{ siteHeader() }
					</div>
					<h2 className="loading-placeholder__content cancel-purchase-loading-placeholder__header" />
					<div className="loading-placeholder__content cancel-purchase-loading-placeholder__subheader" />
					<div className="loading-placeholder__content cancel-purchase-loading-placeholder__reason" />
					<div className="loading-placeholder__content cancel-purchase-loading-placeholder__reason" />
					<div className="loading-placeholder__content cancel-purchase-loading-placeholder__reason" />

					<p className="cancel-purchase--support-link cancel-purchase--support-link--main">
						{ supportLink() }
					</p>
				</div>
				<div className="cancel-purchase__layout-col cancel-purchase__layout-col-right">
					<div className="loading-placeholder__content cancel-purchase-loading-placeholder__site">
						{ siteHeader() }
					</div>

					<p className="cancel-purchase--support-link cancel-purchase--support-link--sidebar">
						{ supportLink() }
					</p>
				</div>
			</div>
		</Main>
	);
};

CancelPurchaseLoadingPlaceholder.propTypes = {
	purchaseId: PropTypes.number.isRequired,
	siteSlug: PropTypes.string.isRequired,
	getManagePurchaseUrlFor: PropTypes.func.isRequired,
};

export default localize( CancelPurchaseLoadingPlaceholder );
