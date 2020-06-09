/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import getPartnerSlugFromQuery from 'state/selectors/get-partner-slug-from-query';
import JetpackHeader from 'components/jetpack-header';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import { retrieveMobileRedirect } from './persistence-utils';

export class JetpackConnectMainWrapper extends PureComponent {
	static propTypes = {
		isWide: PropTypes.bool,
		isWoo: PropTypes.bool,
		wooDnaConfig: PropTypes.object,
		partnerSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
		pageTitle: PropTypes.string,
	};

	static defaultProps = {
		isWide: false,
		isWoo: false,
		wooDnaConfig: null,
	};

	render() {
		const {
			isWide,
			className,
			children,
			partnerSlug,
			translate,
			wooDnaConfig,
			pageTitle,
		} = this.props;

		const isWoo = config.isEnabled( 'jetpack/connect/woocommerce' ) && this.props.isWoo;

		const wrapperClassName = classNames( 'jetpack-connect__main', {
			'is-wide': isWide,
			'is-woocommerce': isWoo || wooDnaConfig,
			'is-mobile-app-flow': !! retrieveMobileRedirect(),
		} );

		const width = isWoo || wooDnaConfig ? 200 : undefined;
		const darkColorScheme = isWoo || wooDnaConfig ? false : true;

		return (
			<Main className={ classNames( className, wrapperClassName ) }>
				<DocumentHead
					title={ pageTitle || translate( 'Jetpack Connect' ) }
					skipTitleFormatting={ Boolean( pageTitle ) }
				/>
				<div className="jetpack-connect__main-logo">
					<JetpackHeader
						partnerSlug={ partnerSlug }
						isWoo={ isWoo }
						isWooDna={ !! wooDnaConfig }
						width={ width }
						darkColorScheme={ darkColorScheme }
					/>
				</div>
				{ children }
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	partnerSlug: getPartnerSlugFromQuery( state ),
} ) )( localize( JetpackConnectMainWrapper ) );
