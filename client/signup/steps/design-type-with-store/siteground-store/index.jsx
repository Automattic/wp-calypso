/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import identity from 'lodash/identity';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import StepHeader from 'signup/step-header';
import Button from 'components/button';
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';

import SitegroundLogo from './siteground-logo';

export const SitegroundStoreStep = ( { onBackClick, translate, partnerClickRecorder, price } ) => (
	<div className="design-type-with-store__partner-box">
		<StepHeader
			headerText={ translate( 'Create a WordPress Store' ) }
			subHeaderText={ translate( 'Our partners at SiteGround and WooCommerce are here for you.' ) }
		/>

		<div className="design-type-with-store__flex-container">
			<div className="design-type-with-store__copy">
				<div className="design-type-with-store__vertical-center">
					<SitegroundLogo />
					<div className="design-type-with-store__text">
						{ translate(
							'We’ve partnered with SiteGround, a top-notch WordPress hosting provider, ' +
							'and WooCommerce, the go-to eCommerce solution for WordPress, ' +
							'to help you get started.'
						) }
					</div>
				</div>
			</div>

			<div className="design-type-with-store__price-box">
				<div className="design-type-with-store__vertical-center">
					<div className="design-type-with-store__price-left">
						<span className="design-type-with-store__price-text"> { translate( 'Starting at' ) } </span>
						<span className="design-type-with-store__price"> <b>{ price }</b>{ translate( '/mo' ) } </span>
					</div>

					<Button
						primary
						className="design-type-with-store__button"
						target="_blank"
						href="https://www.siteground.com/go/wordpress-ecommerce"
						onClick={ partnerClickRecorder }
					>
						{ translate( 'Create Store' ) }
					</Button>
				</div>
			</div>
		</div>

		<div className="design-type-with-store__back-button-wrapper">
			<Button compact borderless onClick={ onBackClick }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ translate( 'Back' ) }
			</Button>
		</div>
	</div>
);

SitegroundStoreStep.displayName = 'SitegroundStoreStep';

SitegroundStoreStep.propTypes = {
	onBackClick: PropTypes.func,
	translate: PropTypes.func,
	partnerClickRecorder: PropTypes.func,
	price: PropTypes.string
};

SitegroundStoreStep.defaultProps = {
	onBackClick: identity,
	translate: identity,
	partnerClickRecorder: identity,
	price: '$3.95'
};

const mapDispatchToProps = dispatch => ( {
	partnerClickRecorder: () =>
		dispatch( recordTracksEvent( 'calypso_triforce_partner_redirect', { 'partner_name': 'SiteGround' } ) )
} );

export default connect( null, mapDispatchToProps )( localize( SitegroundStoreStep ) );
