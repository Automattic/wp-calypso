/**
 * External dependencies
 */
import page from 'page';
import { localize } from 'i18n-calypso';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { identity } from 'lodash';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */

import { errorNotice } from 'calypso/state/notices/actions';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import WordPressLogo from 'calypso/components/wordpress-logo';

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

	renderFloaties() {
		// Non standard gridicon sizes are used here because we display giant, floating icons on the page with an animation
		/* eslint-disable wpcalypso/jsx-gridicon-size, wpcalypso/jsx-classname-namespace */
		return (
			<div className="checkout-thank-you__floaties">
				<Gridicon icon="add" size={ 64 } />
				<Gridicon icon="aside" size={ 64 } />
				<Gridicon icon="attachment" size={ 64 } />
				<Gridicon icon="audio" size={ 64 } />
				<Gridicon icon="bell" size={ 64 } />
				<Gridicon icon="book" size={ 64 } />
				<Gridicon icon="camera" size={ 64 } />
				<Gridicon icon="comment" size={ 64 } />
				<Gridicon icon="globe" size={ 64 } />
				<Gridicon icon="pencil" size={ 64 } />
				<Gridicon icon="phone" size={ 64 } />
				<Gridicon icon="reader" size={ 64 } />
				<Gridicon icon="star" size={ 64 } />
				<Gridicon icon="video" size={ 64 } />
				<Gridicon icon="align-image-right" size={ 64 } />
				<Gridicon icon="bookmark" size={ 64 } />
				<Gridicon icon="briefcase" size={ 64 } />
				<Gridicon icon="calendar" size={ 64 } />
				<Gridicon icon="clipboard" size={ 64 } />
				<Gridicon icon="cloud-upload" size={ 64 } />
				<Gridicon icon="cog" size={ 64 } />
				<Gridicon icon="customize" size={ 64 } />
				<Gridicon icon="help" size={ 64 } />
				<Gridicon icon="link" size={ 64 } />
				<Gridicon icon="lock" size={ 64 } />
				<Gridicon icon="pages" size={ 64 } />
				<Gridicon icon="share" size={ 64 } />
				<Gridicon icon="stats" size={ 64 } />
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size, wpcalypso/jsx-classname-namespace */
	}

	render() {
		const { siteSlug, translate } = this.props;

		return (
			<Main className="checkout-thank-you__transfer-pending">
				{ this.renderFloaties() }
				<PageViewTracker
					path={
						siteSlug
							? '/checkout/thank-you/:site/pending/:order_id'
							: '/checkout/thank-you/no-site/pending/:order_id'
					}
					title="Checkout Pending"
					properties={ siteSlug && { site: siteSlug } }
				/>
				<WordPressLogo size={ 180 } className="checkout-thank-you__wordpress-logo is-large" />
				<EmptyContent
					illustration={ '' }
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
