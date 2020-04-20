/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { identity, noop, sample } from 'lodash';
import store from 'store';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';
import { Dialog } from '@automattic/components';
import { fetchUserSettings } from 'state/user-settings/actions';
import getUserSettings from 'state/selectors/get-user-settings';
import { sendEmailLogin } from 'state/auth/actions';

/**
 * Image dependencies
 */
import wordpressLogoImage from 'assets/images/illustrations/logo-jpc.svg';

/**
 * Style dependencies
 */
import './style.scss';

const getRandomPromo = () => {
	const promoOptions = [
		{
			promoCode: 'a0001',
			message: 'WordPress.com your way — desktop app now available for Mac, Windows, and Linux.',
			type: 'desktop',
		},
		{
			promoCode: 'a0002',
			message: 'Get the WordPress.com app for your desktop.',
			type: 'desktop',
		},
		{
			promoCode: 'a0003',
			message: 'WordPress.com app now available for desktop.',
			type: 'desktop',
		},
		{
			promoCode: 'a0005',
			message: 'Fast, distraction-free WordPress.com — download the desktop app.',
			type: 'desktop',
		},
		{
			promoCode: 'a0006',
			message: 'WordPress.com in the palm of your hands — download the mobile app.',
			type: 'mobile',
		},
	];

	return sample( promoOptions );
};

export const getPromoLink = ( location, promoDetails ) => {
	const { type, promoCode } = promoDetails;

	return `https://apps.wordpress.com/${ type }/?ref=promo_${ location }_${ promoCode }`;
};

export class AppPromo extends React.Component {
	static displayName = 'AppPromo';

	static propTypes = {
		location: PropTypes.string.isRequired,
	};

	constructor( props ) {
		super( props );
		const promoItem = props.promoItem || getRandomPromo();

		this.state = {
			promoItem,
			showPromo: true,
			showDialog: false,
		};
	}

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_desktop_promo_view', {
			promo_location: this.props.location,
			promo_code: this.state.promoItem.promoCode,
		} );
	}

	recordClickEvent = () => {
		this.props.recordTracksEvent( 'calypso_desktop_promo_click', {
			promo_location: this.props.location,
			promo_code: this.state.promoItem.promoCode,
		} );
	};

	dismiss = () => {
		this.setState( { showPromo: false } );
		this.props.saveDismissal();
		this.props.recordTracksEvent( 'calypso_desktop_promo_dismiss', {
			promo_location: this.props.location,
			promo_code: this.state.promoItem.promoCode,
		} );
	};

	sendMagicLink = () => {
		this.recordClickEvent();
		const email = this.props.userSettings.user_email;
		this.props.sendEmailLogin( email, { showGlobalNotices: false, isMobileAppLogin: true } );
		this.onShowDialog();
		return false;
	};

	onShowDialog = () => {
		this.setState( { showDialog: true } );
	};

	onCloseDialog = () => {
		this.setState( { showDialog: false } );
	};

	desktopPromo = ( promoItem ) => {
		const { location, translate } = this.props;

		return (
			<div className="app-promo">
				<button
					tabIndex="0"
					className="app-promo__dismiss"
					onClick={ this.dismiss }
					aria-label={ translate( 'Dismiss' ) }
				>
					<Gridicon icon="cross" size={ 24 } />
				</button>
				<a
					onClick={ this.recordClickEvent }
					className="app-promo__link"
					title="Try the desktop app!"
					href={ this.props.getPromoLink( location, promoItem ) }
					target="_blank"
					rel="noopener noreferrer"
				>
					<img
						className="app-promo__icon"
						src={ wordpressLogoImage }
						width="32"
						height="32"
						alt="WordPress Desktop Icon"
					/>
					{ promoItem.message }
				</a>
			</div>
		);
	};

	mobilePromo = () => {
		const { translate } = this.props;
		const buttons = [ { action: 'cancel', label: translate( 'OK' ) } ];

		return (
			<div className="app-promo">
				<button
					tabIndex="0"
					className="app-promo__dismiss"
					onClick={ this.dismiss }
					aria-label={ translate( 'Dismiss' ) }
				>
					<Gridicon icon="cross" size={ 24 } />
				</button>
				<button
					onClick={ this.sendMagicLink }
					className="app-promo__link"
					title="Try the mobile app!"
				>
					<img
						className="app-promo__icon"
						src={ wordpressLogoImage }
						width="32"
						height="32"
						alt="WordPress App Icon"
					/>
					{ 'WordPress.com in the palm of your hands — download the mobile app.' }
				</button>
				<Dialog
					className="app-promo__dialog"
					isVisible={ this.state.showDialog }
					buttons={ buttons }
					onClose={ this.onCloseDialog }
				>
					<h1>{ translate( 'Check your mail!' ) }</h1>
					<p>
						{ translate(
							"We've sent you an email with links to download and effortlessly log in to the mobile app. Be sure to use them from your mobile device!"
						) }
					</p>
				</Dialog>
			</div>
		);
	};

	render() {
		if ( ! this.state.showPromo ) {
			return null;
		}
		const { promoItem } = this.state;
		return promoItem.type === 'mobile' ? this.mobilePromo() : this.desktopPromo( promoItem );
	}
}

AppPromo.defaultProps = {
	translate: identity,
	recordTracksEvent: noop,
	saveDismissal: () => store.set( 'desktop_promo_disabled', true ),
	getPromoLink,
};

export default connect(
	( state ) => ( {
		userSettings: getUserSettings( state ),
	} ),
	{ fetchUserSettings, recordTracksEvent, sendEmailLogin }
)( localize( AppPromo ) );
