import config from '@automattic/calypso-config';
import { Dialog, Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import store from 'store';
import wordpressLogoImage from 'calypso/assets/images/illustrations/logo-jpc.svg';
import jetpackLogoImage from 'calypso/assets/images/jetpack/wp-to-jp-vertical.svg';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { sendEmailLogin } from 'calypso/state/auth/actions';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { fetchUserSettings } from 'calypso/state/user-settings/actions';

import './style.scss';

const noop = () => {};

const displayJetpackAppBranding = config.isEnabled( 'jetpack/app-branding' );

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

	return promoOptions[ Math.floor( Math.random() * promoOptions.length ) ];
};

export const getPromoLink = ( location, promoDetails ) => {
	const { type, promoCode } = promoDetails;

	return `https://apps.wordpress.com/${ type }/?ref=promo_${ location }_${ promoCode }`;
};

export class AppPromo extends Component {
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

	dismissButton = () => (
		<Button
			tabIndex="0"
			className="app-promo__dismiss"
			onClick={ this.dismiss }
			aria-label={ this.props.translate( 'Dismiss' ) }
		>
			<Gridicon icon="cross" size={ 16 } />
		</Button>
	);

	desktopPromo = ( promoItem ) => {
		const { location } = this.props;

		return (
			<div className="app-promo">
				<Button
					onClick={ this.recordClickEvent }
					className="app-promo__link"
					title="Try the desktop app!"
					href={ this.props.getPromoLink( location, promoItem ) }
					target="_blank"
					rel="noopener noreferrer"
				>
					<p className="app-promo__paragraph">{ promoItem.message }</p>
				</Button>
				{ this.dismissButton() }
			</div>
				<img className="app-promo__icon" src={ wordpressLogoImage } width="32" height="32" alt="" />
		);
	};

	mobilePromo = () => {
		const { translate } = this.props;
		const buttons = [ { action: 'cancel', label: translate( 'OK' ) } ];

		const message = displayJetpackAppBranding
			? translate( '{{a}}Get the Jetpack app{{/a}} to use Reader anywhere, any time.', {
					components: {
						a: <a href="https://wp.com/app" className="app-promo__jetpack-app-link" />,
					},
			  } )
			: translate( 'WordPress.com in the palm of your hands — download the mobile app.' );

		return (
			<div className="app-promo">
				<Button
					onClick={ ! displayJetpackAppBranding ? this.sendMagicLink : undefined }
					className={ classNames( 'app-promo__link', {
						'app-promo_jetpack-app-button': displayJetpackAppBranding,
					} ) }
					title="Try the mobile app!"
				>
					<p className="app-promo__paragraph">{ message }</p>
				</Button>
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
				{ this.dismissButton() }
			</div>
				<img
					className="app-promo__icon"
					src={ displayJetpackAppBranding ? jetpackLogoImage : wordpressLogoImage }
					width={ displayJetpackAppBranding ? 25 : 32 }
					height={ displayJetpackAppBranding ? 43 : 32 }
					alt=""
				/>
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
