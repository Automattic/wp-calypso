/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { PureComponent } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';

export default class PaymentBox extends PureComponent {
	static displayName = 'PaymentBox';

	render() {
		const cardClass = classNames( 'payment-box', this.props.classSet ),
			contentClass = classNames( 'payment-box__content', this.props.contentClassSet );
		return (
			<ReactCSSTransitionGroup
				transitionName={ 'checkout__payment-box-container' }
				transitionAppear={ true }
				transitionAppearTimeout={ 400 }
				transitionEnter={ true }
				transitionEnterTimeout={ 400 }
				transitionLeave={ false } >

				<div className="checkout__payment-box-container"
					key={ this.props.currentPage } >
					<SectionHeader label={ this.props.title } />
					<Card className={ cardClass }>
						<div className="checkout__box-padding">
							<div className={ contentClass }>
								{ this.props.children }
							</div>
						</div>
					</Card>
				</div>
			</ReactCSSTransitionGroup>
		);
	}
}
