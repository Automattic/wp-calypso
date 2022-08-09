import { ProgressBar } from '@automattic/components';
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
		pageTitle: PropTypes.string,
		positionInFlow: PropTypes.number,
		flowLength: PropTypes.number,
		flowName: PropTypes.string,
		shouldShowProgressBar: PropTypes.bool,
	};

	render() {
		const {
			pageTitle,
			shouldShowLoadingScreen,
			isReskinned,
			rightComponent,
			positionInFlow,
			flowLength,
			flowName,
			shouldShowProgressBar,
		} = this.props;

		const logoClasses = classnames( 'wordpress-logo', {
			'is-large': shouldShowLoadingScreen && ! isReskinned,
		} );

		return (
			<div className="signup-header">
				{ flowLength && shouldShowProgressBar && (
					<ProgressBar className={ flowName } value={ positionInFlow + 1 } total={ flowLength } />
				) }
				<WordPressLogo size={ 120 } className={ logoClasses } />
				{ pageTitle && <h1>{ pageTitle }</h1> }
				{ /* This should show a sign in link instead of
			   the progressIndicator on the account step. */ }
				<div className="signup-header__right">{ ! shouldShowLoadingScreen && rightComponent }</div>
			</div>
		);
	}
}
