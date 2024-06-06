import { Modal, Card, CardBody, Icon } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { chevronRight, trendingUp } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { trackStatsAnalyticsEvent } from '../utils';
import StatsUtmBuilderForm from './stats-modeule-utm-builder-form';

interface Props {
	modalClassName: string;
}

interface EmptyStateActionProps {
	text: string;
	icon: JSX.Element;
	onClick: () => void;
}

const EmptyStateAction: React.FC< EmptyStateActionProps > = ( { text, icon, onClick } ) => {
	const handleClick = () => {
		trackStatsAnalyticsEvent( 'utm_builder_opened' );
		trackStatsAnalyticsEvent( 'advanced_feature_interaction', { feature: 'utm_builder' } );

		onClick();
	};

	return (
		<Card className="stats-empty-action__cta" size="small" onClick={ handleClick }>
			<CardBody className="stats-empty-action__card-body">
				<Icon className="stats-empty-action__cta-link-icon" icon={ icon } size={ 20 } />
				<span className="stats-empty-action__cta-link-text">{ text }</span>
				<Icon className="stats-empty-action__cta-link-icon" icon={ chevronRight } size={ 20 } />
			</CardBody>
		</Card>
	);
};

const UTMBuilder: React.FC< Props > = ( { modalClassName } ) => {
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );
	const translate = useTranslate();

	return (
		<>
			<div className="stats-utm-builder__trigger">
				<EmptyStateAction
					icon={ trendingUp }
					text={ translate( 'Open UTM Builder' ) }
					// eventName="calypso_subscribers_empty_view_subscribe_block_clicked"
					onClick={ openModal }
				/>
			</div>
			{ isOpen && (
				<Modal title={ translate( 'UTM Builder' ) } onRequestClose={ closeModal }>
					<div className={ clsx( modalClassName, 'stats-utm-builder-modal' ) }>
						<div className="stats-utm-builder__fields">
							<div className="stats-utm-builder__description">
								{ translate( 'Generate URLs to share and track UTM prameters.' ) }
							</div>
							<StatsUtmBuilderForm />
						</div>
						<div className="stats-utm-builder__help">
							<div className="stats-utm-builder__help-bg"></div>
							<div className="stats-utm-builder__description">
								{ translate( 'More information and parameter example.' ) }
							</div>
							<section>
								<div className="stats-utm-builder__label">{ translate( 'Campaign Source' ) }</div>
								<div className="stats-utm-builder__help-section-parameter">utm_source</div>
								<div>
									{ translate(
										'Use utm_source to identify a search engine, newsletter name or other source.'
									) }
								</div>
								<div className="stats-utm-builder__help-section-parameter-example">
									{ translate( 'Example: newsletter, twitter, google' ) }
								</div>
							</section>
							<section>
								<div className="stats-utm-builder__label">{ translate( 'Campaign Medium' ) }</div>
								<div className="stats-utm-builder__help-section-parameter">utm_medium</div>
								<div>
									{ translate(
										'Use utm_medium to identify a medium such as email or cost-per-click.'
									) }
								</div>
								<div className="stats-utm-builder__help-section-parameter-example">
									{ translate( 'Example: cpc, banner, email' ) }
								</div>
							</section>
							<section>
								<div className="stats-utm-builder__label">{ translate( 'Campaign Name' ) }</div>
								<div className="stats-utm-builder__help-section-parameter">utm_campaign</div>
								<div>
									{ translate(
										'Use utm_campaign to identify a specific product promotion or strategic campaign.'
									) }
								</div>
								<div className="stats-utm-builder__help-section-parameter-example">
									{ translate( 'Example: promotion, sale' ) }
								</div>
							</section>
						</div>
					</div>
				</Modal>
			) }
		</>
	);
};

export default UTMBuilder;
