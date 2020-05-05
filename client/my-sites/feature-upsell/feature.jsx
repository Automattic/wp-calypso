/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import TipInfo from 'components/purchase-detail/tip-info';

export default class Feature extends PureComponent {
	static propTypes = {
		buttonText: PropTypes.string,
		description: PropTypes.oneOfType( [ PropTypes.array, PropTypes.string, PropTypes.object ] ),
		href: PropTypes.string,
		icon: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
		isPlaceholder: PropTypes.bool,
		isRequired: PropTypes.bool,
		isSubmitting: PropTypes.bool,
		onClick: PropTypes.func,
		primaryButton: PropTypes.bool,
		target: PropTypes.string,
		rel: PropTypes.string,
		title: PropTypes.string,
	};

	static defaultProps = {
		onClick: noop,
		primaryButton: false,
	};

	renderPurchaseButton() {
		const {
			buttonText,
			isPlaceholder,
			isSubmitting,
			href,
			onClick,
			primaryButton,
			target,
			rel,
		} = this.props;

		if ( ! buttonText && ! isPlaceholder ) {
			return null;
		}

		return (
			<Button
				disabled={ isSubmitting }
				href={ href }
				onClick={ onClick }
				primary={ primaryButton }
				target={ target }
				rel={ rel }
			>
				{ buttonText }
			</Button>
		);
	}

	renderBody() {
		if ( this.props.body ) {
			return <div className="feature-upsell__feature-body">{ this.props.body }</div>;
		}

		return (
			<div className="feature-upsell__feature-body">
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
			<div className="feature-upsell__feature-icon">
				{ typeof icon === 'string' ? <Gridicon icon={ icon } /> : icon }
				{ isRequired && <Gridicon className="feature-upsell__feature-notice-icon" icon="notice" /> }
			</div>
		);
	}

	render() {
		const { id, title, description } = this.props;

		return (
			<div className="feature-upsell__feature" id={ id }>
				<div className="feature-upsell__feature-content">
					<div className="feature-upsell__feature-image">{ this.renderIcon() }</div>
					<div className="feature-upsell__feature-text">
						<h3 className="feature-upsell__feature-title">{ title }</h3>
						<div className="feature-upsell__feature-description">{ description }</div>
						{ this.renderBody() }
					</div>
				</div>
			</div>
		);
	}
}
