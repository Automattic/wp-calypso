import classNames from 'classnames';
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
		isWooOnboarding: PropTypes.bool,
		isWooCoreProfiler: PropTypes.bool,
		isWpcomMigration: PropTypes.bool,
		wooDnaConfig: PropTypes.object,
		partnerSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
		pageTitle: PropTypes.string,
	};

	static defaultProps = {
		isWide: false,
		isWooOnboarding: false,
		isWooCoreProfiler: false,
		wooDnaConfig: null,
	};

	render() {
		const {
			isAutomatticForAgencies,
			isWide,
			isWooOnboarding,
			isWooCoreProfiler,
			isWpcomMigration,
			className,
			children,
			partnerSlug,
			translate,
			wooDnaConfig,
			pageTitle,
		} = this.props;

		const isWooDna = wooDnaConfig && wooDnaConfig.isWooDnaFlow();

		const wrapperClassName = classNames( 'jetpack-connect__main', {
			'is-wide': isWide,
			'is-woocommerce': isWooOnboarding || isWooDna || isWooCoreProfiler,
			'is-woocommerce-core-profiler-flow': isWooCoreProfiler,
			'is-mobile-app-flow': !! retrieveMobileRedirect(),
			'is-wpcom-migration': isWpcomMigration,
			'is-automattic-for-agencies-flow': isAutomatticForAgencies,
		} );

		const width = isWooOnboarding || isWooDna ? 200 : undefined;
		const darkColorScheme = false;

		return (
			<Main className={ classNames( className, wrapperClassName ) }>
				<DocumentHead
					title={ pageTitle || translate( 'Jetpack Connect' ) }
					skipTitleFormatting={ Boolean( pageTitle ) }
				/>
				<div className="jetpack-connect__main-logo">
					{ ! isWpcomMigration && (
						<JetpackHeader
							partnerSlug={ partnerSlug }
							isAutomatticForAgencies={ isAutomatticForAgencies }
							isWooOnboarding={ isWooOnboarding }
							isWooCoreProfiler={ isWooCoreProfiler }
							isWooDna={ isWooDna }
							width={ width }
							darkColorScheme={ darkColorScheme }
						/>
					) }
				</div>
				{ children }
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	partnerSlug: getPartnerSlugFromQuery( state ),
} ) )( localize( JetpackConnectMainWrapper ) );
