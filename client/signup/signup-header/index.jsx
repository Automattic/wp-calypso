import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';
import WordPressLogo from 'calypso/components/wordpress-logo';
import './style.scss';

export default class SignupHeader extends Component {
	static propTypes = {
		shouldShowLoadingScreen: PropTypes.bool,
		isReskinned: PropTypes.bool,
		rightComponent: PropTypes.node,
	};

	render() {
		const logoClasses = classnames( 'wordpress-logo', {
			'is-large': this.props.shouldShowLoadingScreen && ! this.props.isReskinned,
		} );

		return (
			<div className="signup-header">
				<WordPressLogo size={ 120 } className={ logoClasses } />

				{ /* Ideally, this is where the back button
			   would live. But thats hard to move, it seems. */ }
				<div className="signup-header__left" />

				{ /* This should show a sign in link instead of
			   the progressIndicator on the account step. */ }
				<div className="signup-header__right">
					{ ! this.props.shouldShowLoadingScreen && this.props.rightComponent }
				</div>
			</div>
		);
	}
}
