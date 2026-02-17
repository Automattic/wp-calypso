import { Button } from '@wordpress/components';
import { chevronLeftSmall } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackHeader from 'calypso/components/jetpack-header';
import Main from 'calypso/components/main';
import getPartnerSlugFromQuery from 'calypso/state/selectors/get-partner-slug-from-query';
import { retrieveMobileRedirect } from './persistence-utils';

export class JetpackConnectMainWrapper extends PureComponent {
	static propTypes = {
		isWide: PropTypes.bool,
		isWooJPC: PropTypes.bool,
		wooDnaConfig: PropTypes.object,
		partnerSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
		pageTitle: PropTypes.string,
		// Whether to use a compact logo in the left corner or the main center logo
		useCompactLogo: PropTypes.bool,
		compactBackButton: PropTypes.bool,
	};

	static defaultProps = {
		isWide: false,
		isWooJPC: false,
		wooDnaConfig: null,
		useCompactLogo: false,
	};

	render() {
		const {
			isWide,
			isWooJPC,
			isFromAutomatticForAgenciesPlugin,
			className,
			children,
			partnerSlug,
			translate,
			pageTitle,
			useCompactLogo,
			compactBackButton,
		} = this.props;

		const wrapperClassName = clsx( 'jetpack-connect__main', {
			'is-wide': isWide,
			'is-woocommerce': isWooJPC,
			'is-woocommerce-core-profiler-flow': isWooJPC,
			'is-mobile-app-flow': !! retrieveMobileRedirect(),
			'is-automattic-for-agencies-flow': isFromAutomatticForAgenciesPlugin,
		} );

		const darkColorScheme = false;

		return (
			<Main className={ clsx( className, wrapperClassName ) }>
				{ useCompactLogo && (
					<>
						<div className="jetpack-connect__compact-logo">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
							>
								<path
									d="M12 0C9.62663 0 7.30655 0.703788 5.33316 2.02236C3.35977 3.34094 1.8217 5.21508 0.913451 7.4078C0.00519938 9.60051 -0.232441 12.0133 0.230582 14.3411C0.693605 16.6689 1.83649 18.807 3.51472 20.4853C5.19295 22.1635 7.33115 23.3064 9.65892 23.7694C11.9867 24.2324 14.3995 23.9948 16.5922 23.0865C18.7849 22.1783 20.6591 20.6402 21.9776 18.6668C23.2962 16.6934 24 14.3734 24 12C24 8.8174 22.7357 5.76515 20.4853 3.51472C18.2348 1.26428 15.1826 0 12 0ZM11.3684 13.9895H5.40632L11.3684 2.35579V13.9895ZM12.5811 21.6189V9.98526H18.5621L12.5811 21.6189Z"
									fill="#069E08"
								/>
							</svg>
							{ compactBackButton && (
								<Button
									compact
									borderless
									icon={ chevronLeftSmall }
									className="jetpack-connect__back-button jetpack-connect__back-button--compact"
									onClick={ compactBackButton }
								>
									{ translate( 'Back' ) }
								</Button>
							) }
						</div>
					</>
				) }
				<DocumentHead
					title={ pageTitle || translate( 'Jetpack Connect' ) }
					skipTitleFormatting={ Boolean( pageTitle ) }
				/>
				{ ! useCompactLogo && ! isWooJPC && (
					<div className="jetpack-connect__main-logo">
						<JetpackHeader
							partnerSlug={ partnerSlug }
							isFromAutomatticForAgenciesPlugin={ isFromAutomatticForAgenciesPlugin }
							darkColorScheme={ darkColorScheme }
						/>
					</div>
				) }
				{ ! useCompactLogo && isWooJPC && (
					<div className="jetpack-connect__main-logo">
						<svg
							className="jetpack-connect__woo-topbar-icon"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle cx="12" cy="12" r="12" fill="#873EFF" />
							<path
								d="M8.10061 8.54492C9.11488 8.54492 9.53385 8.97488 9.53386 9.98914V13.1422L11.3309 9.62534C11.7388 8.83157 12.268 8.54493 12.9294 8.54492C13.7673 8.54492 14.2193 9.00796 14.2193 9.95609V13.1422L16.1266 9.5592C16.5456 8.77645 17.0086 8.54492 17.7252 8.54492C19.0592 8.54492 19.4892 9.31667 18.8828 10.342L16.1156 15.0164C15.4872 16.0858 14.8367 16.4717 13.9548 16.4717C12.8303 16.4717 12.1026 15.7992 12.1026 14.6747V12.7674L10.9009 15.0164C10.3607 16.0307 9.64409 16.4717 8.75109 16.4717C7.63759 16.4717 6.87689 15.7992 6.87689 14.6637V10.6396H6.02798C5.26728 10.6396 4.84833 10.2537 4.84833 9.58123C4.84833 8.90873 5.24523 8.54492 6.02798 8.54492H8.10061Z"
								fill="white"
							/>
						</svg>
					</div>
				) }
				{ children }
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	partnerSlug: getPartnerSlugFromQuery( state ),
} ) )( localize( JetpackConnectMainWrapper ) );
