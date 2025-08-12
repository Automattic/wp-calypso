import { Card, WordPressLogo } from '@automattic/components';
import PropTypes from 'prop-types';
import { Component } from 'react';

import './style.scss';

class DomainsLandingHeader extends Component {
	static propTypes = {
		reseller: PropTypes.string,
		title: PropTypes.string,
	};

	/**
	 * Gets the header logo depending on the reseller
	 *
	 * If the reseller is undefined, returns the WordPress logo.
	 */
	getLogo = () => {
		const tumblrLogo = (
			<svg className="header__logo" viewBox="0 0 90.2 159.3" height={ 52 } width={ 52 }>
				<path d="M63.6,159.3c-24,0-41.8-12.3-41.8-41.8V70.3H0V44.7C24,38.5,34,17.9,35.1,0H60v40.6h29v29.7H60v41.1  c0,12.3,6.2,16.6,16.1,16.6h14.1v31.3H63.6z" />
			</svg>
		);

		switch ( this.props.reseller ) {
			case 'tumblr_live':
			case 'tumblr_ote':
				return tumblrLogo;
			default:
				return <WordPressLogo className="header__logo" size={ 52 } />;
		}
	};

	render() {
		const { title } = this.props;
		return (
			<Card className="header">
				{ this.getLogo() }
				{ title && <h2 className="header__title">{ title }</h2> }
			</Card>
		);
	}
}

export default DomainsLandingHeader;
