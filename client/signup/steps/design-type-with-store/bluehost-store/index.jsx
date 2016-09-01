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

export const BluehostStoreStep = props => {
	const {
		onBackClick,
		translate,
		partnerClickRecorder,
		partnerName,
	} = props;

	let copyText = translate(
		'We’ve partnered with BlueHost, a top-notch WordPress hosting provider, ' +
		'to start your online store. Create your account and choose your ' +
		'favorite WordPress eCommerce solution.'
	);

	let subHeaderText = translate( 'Our partners at BlueHost are here for you.'	);
	let partnerUrl = 'https://www.bluehost.com/track/wp/dotcomsans1?page=/wordpress';
	let price = '$2.95';

	if ( 'Bluehost with WooCommerce' === partnerName ) {
		copyText = translate(
			'We’ve partnered with BlueHost, a top-notch WordPress hosting provider, ' +
			'and WooCommerce, the go-to eCommerce solution for WordPress, ' +
			'to help you get started.'
		);

		subHeaderText = translate( 'Our partners at BlueHost and WooCommerce are here for you.' );
		partnerUrl = 'https://www.bluehost.com/track/wp/dotcomwoo1?page=/wordpress-woocommerce';
		price = '$11.95';
	}

	return (
		<div className="design-type-with-store__partner-box">
			<StepHeader
				headerText={ translate( 'Create a WordPress Store' ) }
				subHeaderText={ subHeaderText }
			/>

			<div className="design-type-with-store__flex-container">
				<div className="design-type-with-store__copy">
					<div className="design-type-with-store__vertical-center">
						<img src="/calypso/images/signup/bluehost-logo.png" className="design-type-with-store__bluehost-logo" />
						{ copyText}
					</div>
				</div>

				<div className="design-type-with-store__price-box">
					<div className="design-type-with-store__vertical-center">
						<div className="design-type-with-store__price-left">
							<span className="design-type-with-store__price-text"> { translate( 'Starting at' ) } </span>
							<span className="design-type-with-store__price"> <b>{ price }</b>{ translate( '/mo') } </span>
						</div>

						<Button
							primary
							className="design-type-with-store__button"
							target="_blank"
							rel="noopener noreferrer"
							href={ partnerUrl }
							onClick={ partnerClickRecorder( partnerName ) }
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
};

BluehostStoreStep.displayName = 'BluehostStoreStep';

BluehostStoreStep.propTypes = {
	onBackClick: PropTypes.func,
	translate: PropTypes.func,
	recordPartnerClick: PropTypes.func,
	partnerName: PropTypes.string,
};

BluehostStoreStep.defaultProps = {
	onBackClick: identity,
	translate: identity,
	recordPartnerClick: identity,
	partnerName: 'Bluehost'
};

const mapDispatchToProps = dispatch => ( {
	partnerClickRecorder: partnerName => () =>
		dispatch( recordTracksEvent( 'calypso_triforce_partner_redirect', { 'partner_name': partnerName } ) )
} );

export default connect( null, mapDispatchToProps )( localize( BluehostStoreStep ) );
