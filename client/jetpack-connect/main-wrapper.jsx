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
		partnerSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isWide: false,
		isWoo: false,
	};

	render() {
		const { isWide, className, children, partnerSlug, translate } = this.props;

		const isWoo = config.isEnabled( 'jetpack/connect/woocommerce' ) && this.props.isWoo;

		const wrapperClassName = classNames( 'jetpack-connect__main', {
			'is-wide': isWide,
			'is-woocommerce': isWoo,
			'is-mobile-app-flow': !! retrieveMobileRedirect(),
		} );

		const width = isWoo ? 200 : undefined;
		const darkColorScheme = isWoo ? false : true;

		return (
			<Main className={ classNames( className, wrapperClassName ) }>
				<DocumentHead title={ translate( 'Jetpack Connect' ) } />
				<div className="jetpack-connect__main-logo">
					<JetpackHeader
						partnerSlug={ partnerSlug }
						isWoo={ isWoo }
						width={ width }
						darkColorScheme={ darkColorScheme }
					/>
				</div>
				{ children }
			</Main>
		);
	}
}

export default connect( state => ( {
	partnerSlug: getPartnerSlugFromQuery( state ),
} ) )( localize( JetpackConnectMainWrapper ) );
