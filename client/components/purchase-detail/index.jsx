/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import PurchaseButton from './purchase-button';
import TipInfo from './tip-info';

export default class PurchaseDetail extends PureComponent {
	static propTypes = {
		buttonText: PropTypes.string,
		description: PropTypes.oneOfType( [
			PropTypes.array,
			PropTypes.string,
			PropTypes.object
		] ),
		href: PropTypes.string,
		icon: PropTypes.string,
		isPlaceholder: PropTypes.bool,
		isRequired: PropTypes.bool,
		isSubmitting: PropTypes.bool,
		onClick: PropTypes.func,
		requiredText: PropTypes.string,
		target: PropTypes.string,
		rel: PropTypes.string,
		title: PropTypes.string,
	};

	static defaultProps = {
		onClick: noop,
	};

	renderPurchaseButton() {
		const { buttonText, isPlaceholder, isSubmitting, href, onClick, target, rel } = this.props;

		if ( ! buttonText && ! isPlaceholder ) {
			return null;
		}

		return (
			<PurchaseButton
				disabled={ isSubmitting }
				href={ href }
				onClick={ onClick }
				target={ target }
				rel={ rel }
				text={ buttonText }
			/>
		);
	}

	renderBody() {
		if ( this.props.body ) {
			return (
				<div className="purchase-detail__body">{ this.props.body }</div>
			);
		}

		return (
			<div className="purchase-detail__body">
				{ this.renderPurchaseButton() }
				{ this.props.info && <TipInfo info={ this.props.info } /> }
			</div>
		);
	}

	renderIcon() {
		const { icon, isRequired } = this.props;

		if ( ! icon ) {
			return null;
		}

		return (
			<div className="purchase-detail__icon">
				<Gridicon icon={ icon } />
				{ isRequired && <Gridicon className="purchase-detail__notice-icon" icon="notice" /> }
			</div>
		);
	}

	render() {
		const { id, requiredText, title, description } = this.props;
		const classes = classNames( 'purchase-detail', {
			'is-placeholder': this.props.isPlaceholder,
		} );

		return (
			<div className={ classes } id={ id }>
				{ requiredText && (
					<div className="purchase-detail__required-notice">
						<em>{ requiredText }</em>
					</div>
				) }
				<div className="purchase-detail__content">
					{ this.renderIcon() }

					<div className="purchase-detail__text">
						<h3 className="purchase-detail__title">{ title }</h3>
						<div className="purchase-detail__description">{ description }</div>
					</div>

					{ this.renderBody() }
				</div>
			</div>
		);
	}
}
