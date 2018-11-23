/** @format */

/**
 * External dependencies
 */
import page from 'page';
import { localize } from 'i18n-calypso';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */

import { errorNotice } from 'state/notices/actions';
import EmptyContent from 'components/empty-content';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getSiteSlug } from 'state/sites/selectors';
import getAtomicTransfer from 'state/selectors/get-atomic-transfer';
import { transferStates } from 'state/atomic-transfer/constants';

class TransferPending extends PureComponent {
	static propTypes = {
		error: PropTypes.object,
		localize: PropTypes.func,
		showErrorNotice: PropTypes.func,
		siteId: PropTypes.number.isRequired,
		transfer: PropTypes.object,
	};

	static defaultProps = {
		localize: identity,
		errorNotice: identity,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { transfer, error } = nextProps;
		const { translate, showErrorNotice, siteSlug, orderId } = this.props;

		const retryOnError = () => {
			page( `/stats/${ siteSlug }` );

			showErrorNotice(
				translate( "Sorry, we couldn't process your transfer. Please try again later." )
			);
		};

		if ( transfer ) {
			if ( transferStates.COMPLETED === transfer.status ) {
				page( `/checkout/thank-you/${ siteSlug }/${ orderId }` );

				return;
			}

			// If the processing status indicates that there was something wrong.
			if ( transferStates.ERROR === transfer.status ) {
				// Redirect users back to the stats page so they can try again.
				retryOnError();

				return;
			}
		}

		// A HTTP error occurs. We use the same handling
		if ( error ) {
			retryOnError();
		}
	}

	render() {
		const { siteSlug, translate } = this.props;

		return (
			<Main className="checkout-thank-you__transfer-pending">
				<PageViewTracker
					path={
						siteSlug
							? '/checkout/thank-you/:site/pending/:order_id'
							: '/checkout/thank-you/no-site/pending/:order_id'
					}
					title="Checkout Pending"
					properties={ siteSlug && { site: siteSlug } }
				/>
				<EmptyContent
					illustration={ '/calypso/images/illustrations/illustration-shopping-bags.svg' }
					illustrationWidth={ 500 }
					title={ translate( 'Processing…' ) }
					line={ translate( "Almost there – we're currently finalizing your order." ) }
				/>
			</Main>
		);
	}
}

export default connect(
	( state, { siteId } ) => ( {
		siteSlug: getSiteSlug( state, siteId ),
		transfer: getAtomicTransfer( state, siteId ),
	} ),
	{ showErrorNotice: errorNotice }
)( localize( TransferPending ) );
