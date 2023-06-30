import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import { ThankYouSection } from 'calypso/my-sites/checkout/checkout-thank-you/thank-you';
import PurchaseButton from './purchase-button';
import TipInfo from './tip-info';

import './style.scss';

const noop = () => {};

export default class PurchaseDetail extends PureComponent {
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
		requiredText: PropTypes.string,
		target: PropTypes.string,
		rel: PropTypes.string,
		title: PropTypes.string,
	};

	static defaultProps = {
		onClick: noop,
		primaryButton: false,
	};

	renderPurchaseButton() {
		const { buttonText, isPlaceholder, isSubmitting, href, onClick, primaryButton, target, rel } =
			this.props;

		if ( ! buttonText && ! isPlaceholder ) {
			return null;
		}

		return (
			<PurchaseButton
				disabled={ isSubmitting }
				href={ href }
				onClick={ onClick }
				primary={ primaryButton }
				target={ target }
				rel={ rel }
				text={ buttonText }
			/>
		);
	}

	renderBody() {
		if ( this.props.body ) {
			return <div className="purchase-detail__body">{ this.props.body }</div>;
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
				{ typeof icon === 'string' ? <Gridicon icon={ icon } /> : icon }
				{ isRequired && <Gridicon className="purchase-detail__notice-icon" icon="notice" /> }
			</div>
		);
	}

	render() {
		const { title, description } = this.props;
		const sections = [
			{
				sectionKey: 'whats_next',
				nextSteps: [
					{
						stepKey: 'visit_site',
						stepTitle: title,
						stepDescription: description,
						stepCta: this.renderBody(),
					},
				],
			},
		];

		return sections.map( ( sectionProps, index ) => (
			<ThankYouSection key={ index } { ...sectionProps } />
		) );
	}
}
