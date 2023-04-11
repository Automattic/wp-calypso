import { Card } from '@automattic/components';
import PropTypes from 'prop-types';
import { Component } from 'react';
import WordPressLogo from 'calypso/components/wordpress-logo';

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
		// TODO: This is a placehodler, get the official Tumblr logo from somewhere
		const tumblrLogo = (
			<svg className="header__logo" viewBox="0 0 260 260" height={ 50 } width={ 50 }>
				<path d="M210.857,197.545c-1.616-0.872-3.584-0.787-5.119,0.223c-11.62,7.638-23.4,11.511-35.016,11.511 c-6.242,0-11.605-1.394-16.416-4.275c-3.27-1.936-6.308-5.321-7.397-8.263c-1.057-2.797-1.045-10.327-1.029-20.748l0.005-63.543 h52.795c2.762,0,5-2.239,5-5V62.802c0-2.761-2.238-5-5-5h-52.795V5c0-2.761-2.238-5-5-5h-35.566c-2.528,0-4.658,1.887-4.964,4.397 c-1.486,12.229-4.258,22.383-8.247,30.196c-3.89,7.7-9.153,14.401-15.651,19.925c-5.206,4.44-14.118,8.736-26.49,12.769 c-2.058,0.671-3.45,2.589-3.45,4.754v35.41c0,2.761,2.238,5,5,5h28.953v82.666c0,12.181,1.292,21.347,3.952,28.026 c2.71,6.785,7.521,13.174,14.303,18.993c6.671,5.716,14.79,10.187,24.158,13.298c9.082,2.962,16.315,4.567,28.511,4.567 c10.31,0,20.137-1.069,29.213-3.179c8.921-2.082,19.017-5.761,30.008-10.934c1.753-0.825,2.871-2.587,2.871-4.524v-39.417 C213.484,200.108,212.476,198.418,210.857,197.545z" />
			</svg>
		);

		switch ( this.props.reseller ) {
			case 'tumblr':
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
