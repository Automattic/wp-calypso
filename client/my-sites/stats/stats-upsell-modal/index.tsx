import { Gridicon } from '@automattic/components';
import { Button, Modal } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function StatsUpsellModal( {
	onClose,
	onSubmit,
}: {
	onClose: () => void;
	onSubmit: () => void;
} ) {
	const translate = useTranslate();
	return (
		<Modal
			className="stats-upsell-modal"
			onRequestClose={ onClose }
			shouldCloseOnClickOutside={ false }
			__experimentalHideHeader={ true }
		>
			<Button
				className="stats-upsell-modal__close-button"
				onClick={ onClose }
				icon={ close }
				label={ translate( 'Close' ) }
			/>
			<div className="stats-upsell-modal__content">
				<div className="stats-upsell-modal__left">
					<div className="stats-upsell-modal__title">
						{ translate( 'Grow faster with Advanced Stats' ) }
					</div>
					<div className="stats-upsell-modal__text">
						{ translate( 'Finesse your scaling up strategy with detailed insights and data.' ) }
					</div>
					<Button variant="primary" className="stats-upsell-modal__button" onClick={ onSubmit }>
						{ translate( 'Upgrade to Personal' ) }
					</Button>
				</div>
				<div className="stats-upsell-modal__right">
					<h2 className="stats-upsell-modal__plan">{ translate( 'Personal Plan' ) }</h2>
					<div className="stats-upsell-modal__price-amount">
						US$<span>4</span>
					</div>
					<div className="stats-upsell-modal__price-per-month">
						{ translate( 'per month, US$48 billed yearly' ) }
					</div>
					<div className="stats-upsell-modal__features">
						<div className="stats-upsell-modal__feature">
							<Gridicon icon="checkmark" />
							<div className="stats-upsell-modal__feature-text">
								{ translate(
									'All stats available: traffic trends, sources, optimal time to post…'
								) }
							</div>
						</div>
						<div className="stats-upsell-modal__feature">
							<Gridicon icon="checkmark" />
							<div className="stats-upsell-modal__feature-text">
								{ translate( 'Download data as CSV' ) }
							</div>
						</div>
						<div className="stats-upsell-modal__feature">
							<Gridicon icon="checkmark" />
							<div className="stats-upsell-modal__feature-text">
								{ translate( 'Instant access to upcoming features' ) }
							</div>
						</div>
						<div className="stats-upsell-modal__feature">
							<Gridicon icon="checkmark" />
							<div className="stats-upsell-modal__feature-text">
								{ translate( '14-day money back guarantee' ) }
							</div>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
}
