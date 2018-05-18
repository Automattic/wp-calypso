/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { retrieveMobileRedirect } from './persistence-utils';
import JetpackHeader from 'components/jetpack-header';
import getPartnerSlugFromQuery from 'state/selectors/get-partner-slug-from-query';

export class JetpackConnectMainWrapper extends PureComponent {
	static propTypes = {
		isWide: PropTypes.bool,
		partnerSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isWide: false,
	};

	render() {
		const { isWide, className, children } = this.props;
		const wrapperClassName = classNames( 'jetpack-connect__main', {
			'is-wide': isWide,
			'is-mobile-app-flow': !! retrieveMobileRedirect(),
		} );

		return (
			<Main className={ classNames( className, wrapperClassName ) }>
				<div className="jetpack-connect__main-logo">
					<JetpackHeader partnerSlug={ this.props.partnerSlug } />
				</div>
				{ children }
			</Main>
		);
	}
}

export default connect( state => ( {
	partnerSlug: getPartnerSlugFromQuery( state ),
} ) )( localize( JetpackConnectMainWrapper ) );
