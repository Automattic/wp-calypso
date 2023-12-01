import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { localize, translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import store from 'store';
import wordpressLogoImage from 'calypso/assets/images/illustrations/logo-jpc.svg';
import jetpackLogoImage from 'calypso/assets/images/jetpack/wp-to-jp-vertical.svg';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { fetchUserSettings } from 'calypso/state/user-settings/actions';

import './style.scss';

const noop = () => {};

const getRandomPromo = () => {
	const desktopAppLink = <span className="app-promo-sidebar__wp-app-link" />;

	const promoOptions = [
		{
			promoCode: 'a0001',
			message: translate(
				'WordPress.com your way — {{span}}desktop app now available for Mac, Windows, and Linux{{/span}}.',
				{
					components: {
						span: desktopAppLink,
					},
				}
			),
			type: 'desktop',
		},
		{
			promoCode: 'a0002',
			message: translate( 'Get the {{span}}WordPress.com app{{/span}} for your desktop.', {
				components: {
					span: desktopAppLink,
				},
			} ),
			type: 'desktop',
		},
		{
			promoCode: 'a0003',
			message: translate( '{{span}}WordPress.com app{{/span}} now available for desktop.', {
				components: {
					span: desktopAppLink,
				},
			} ),
			type: 'desktop',
		},
		{
			promoCode: 'a0005',
			message: translate(
				'Fast, distraction-free WordPress.com — {{span}}download the desktop app{{/span}}.',
				{
					components: {
						span: desktopAppLink,
					},
				}
			),
			type: 'desktop',
		},
		{
			promoCode: 'a0006',
			message: translate(
				'WordPress.com in the palm of your hands — {{span}}download the mobile app{{/span}}.',
				{
					components: {
						span: desktopAppLink,
					},
				}
			),

			type: 'mobile',
		},
	];

	return promoOptions[ Math.floor( Math.random() * promoOptions.length ) ];
};

export const getPromoLink = ( location, promoDetails ) => {
	const { type, promoCode } = promoDetails;

	return localizeUrl(
		`https://apps.wordpress.com/${ type }/?ref=promo_${ location }_${ promoCode }`
	);
};

export class AppPromoSidebar extends Component {
	static displayName = 'AppPromoSidebar';

	static propTypes = {
		location: PropTypes.string.isRequired,
	};

	constructor( props ) {
		super( props );
		const promoItem = props.promoItem || getRandomPromo();

		this.state = {
			promoItem,
			showPromo: true,
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

	dismissButton = () => (
		<Button
			className="app-promo-sidebar__dismiss"
			onClick={ this.dismiss }
			aria-label={ this.props.translate( 'Dismiss' ) }
		>
			<Gridicon icon="cross" size={ 16 } />
		</Button>
	);

	desktopPromo = ( promoItem ) => {
		const { location } = this.props;

		return (
			<Button
				onClick={ this.recordClickEvent }
				className="app-promo-sidebar__link"
				title="Try the desktop app!"
				href={ this.props.getPromoLink( location, promoItem ) }
				target="_blank"
				rel="noopener noreferrer"
			>
				<img
					className="app-promo-sidebar__icon"
					src={ wordpressLogoImage }
					width="32"
					height="32"
					alt=""
				/>
				<p className="app-promo-sidebar__paragraph">{ promoItem.message }</p>
			</Button>
		);
	};

	mobilePromo = ( promoItem ) => {
		const { location } = this.props;

		const message = translate(
			'{{span}}Get the Jetpack app{{/span}} to use Reader anywhere, any time.',
			{
				components: {
					span: <span className="app-promo-sidebar__jetpack-app-link" />,
				},
			}
		);

		return (
			<Button
				onClick={ this.recordClickEvent }
				className="app-promo-sidebar__link"
				title="Try the mobile app!"
				href={ this.props.getPromoLink( location, promoItem ) }
				target="_blank"
				rel="noopener noreferrer"
			>
				<img
					className="app-promo-sidebar__icon"
					src={ jetpackLogoImage }
					width={ 25 }
					height={ 43 }
					alt=""
				/>
				<p className="app-promo-sidebar__paragraph">{ message }</p>
			</Button>
		);
	};

	render() {
		if ( ! this.state.showPromo ) {
			return null;
		}
		const { promoItem } = this.state;
		return (
			<div className="app-promo-sidebar">
				{ promoItem.type === 'mobile'
					? this.mobilePromo( promoItem )
					: this.desktopPromo( promoItem ) }
				{ this.dismissButton() }
			</div>
		);
	}
}

AppPromoSidebar.defaultProps = {
	recordTracksEvent: noop,
	saveDismissal: () => store.set( 'desktop_promo_disabled', true ),
	getPromoLink,
};

export default connect(
	( state ) => ( {
		userSettings: getUserSettings( state ),
	} ),
	{ fetchUserSettings, recordTracksEvent }
)( localize( AppPromoSidebar ) );
