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
		isWpcomMigration: PropTypes.bool,
		wooDnaConfig: PropTypes.object,
		partnerSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
		pageTitle: PropTypes.string,
		// Whether to use a compact logo in the left corner or the main center logo
		useCompactLogo: PropTypes.bool,
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
			isWpcomMigration,
			isFromAutomatticForAgenciesPlugin,
			className,
			children,
			partnerSlug,
			translate,
			wooDnaConfig,
			pageTitle,
			useCompactLogo,
		} = this.props;

		const isWooDna = wooDnaConfig && wooDnaConfig.isWooDnaFlow();

		const wrapperClassName = clsx( 'jetpack-connect__main', {
			'is-wide': isWide,
			'is-woocommerce': isWooDna || isWooJPC,
			'is-woocommerce-core-profiler-flow': isWooJPC,
			'is-mobile-app-flow': !! retrieveMobileRedirect(),
			'is-wpcom-migration': isWpcomMigration,
			'is-automattic-for-agencies-flow': isFromAutomatticForAgenciesPlugin,
		} );

		// Note: legacy flow here was "merged" with DNA
		const width = isWooDna ? 200 : undefined;
		const darkColorScheme = false;

		return (
			<Main className={ clsx( className, wrapperClassName ) }>
				{ useCompactLogo && (
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
					</div>
				) }
				<DocumentHead
					title={ pageTitle || translate( 'Jetpack Connect' ) }
					skipTitleFormatting={ Boolean( pageTitle ) }
				/>
				{ ! useCompactLogo && (
					<div className="jetpack-connect__main-logo">
						{ ! isWpcomMigration && (
							<JetpackHeader
								partnerSlug={ partnerSlug }
								isFromAutomatticForAgenciesPlugin={ isFromAutomatticForAgenciesPlugin }
								isWooJPC={ isWooJPC }
								isWooDna={ isWooDna }
								width={ width }
								darkColorScheme={ darkColorScheme }
							/>
						) }
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
