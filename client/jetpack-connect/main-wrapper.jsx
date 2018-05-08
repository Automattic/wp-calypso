/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';
import Main from 'components/main';
import { retrieveMobileRedirect } from './persistence-utils';

export class JetpackConnectMainWrapper extends PureComponent {
	static propTypes = {
		isWide: PropTypes.bool,
		partnerSlug: PropTypes.string,
	};

	static defaultProps = {
		isWide: false,
	};

	render() {
		const { isWide, className, children, partnerSlug } = this.props;
		const wrapperClassName = classNames( 'jetpack-connect__main', {
			'is-wide': isWide,
			'is-mobile-app-flow': !! retrieveMobileRedirect(),
		} );

		return (
			<Main className={ classNames( className, wrapperClassName ) }>
				<div className="jetpack-connect__main-logo">
					<JetpackLogo full size={ 45 } partnerSlug={ partnerSlug } />
				</div>
				{ children }
			</Main>
		);
	}
}

export default JetpackConnectMainWrapper;
