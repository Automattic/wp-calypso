import { Modal, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { link } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { trackStatsAnalyticsEvent } from '../utils';
import StatsUtmBuilderForm from './stats-module-utm-builder-form';

interface Props {
	modalClassName: string;
}

const UTMBuilder: React.FC< Props > = ( { modalClassName } ) => {
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );
	const translate = useTranslate();

	const handleClick = () => {
		trackStatsAnalyticsEvent( 'utm_builder_opened' );
		trackStatsAnalyticsEvent( 'advanced_feature_interaction', { feature: 'utm_builder' } );

		openModal();
	};

	return (
		<>
			<Button
				icon={ link }
				className="stats-utm-builder__trigger"
				onClick={ handleClick }
				variant="secondary"
			>
				{ translate( 'URL Builder' ) }
			</Button>
			{ isOpen && (
				<Modal
					title={ translate( 'URL Builder' ) }
					onRequestClose={ closeModal }
					overlayClassName="stats-utm-builder__overlay"
				>
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
								{ translate( 'Parameter descriptions and examples.' ) }
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
									{ translate( 'Example: newsletter, X, Google' ) }
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
