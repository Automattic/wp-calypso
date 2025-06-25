import config from '@automattic/calypso-config';
import { Modal, Button, VisuallyHidden } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { link } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useRef } from 'react';
import { trackStatsAnalyticsEvent } from '../utils';
import StatsUtmBuilderForm, { type UtmBuilderProps } from './stats-module-utm-builder-form';

interface Props {
	modalClassName: string;
	trigger?: React.ReactElement;
	initialData?: UtmBuilderProps[ 'initialData' ];
}

const UTMBuilder: React.FC< Props > = ( { modalClassName, trigger, initialData } ) => {
	const [ isOpen, setOpen ] = useState< boolean | null >( null );
	const scrollY = useRef( { y: 0, mobile: false } );

	const openModal = () => {
		const isMobile = document.body.scrollTop > 0;
		scrollY.current.mobile = isMobile;
		scrollY.current.y = isMobile ? document.body.scrollTop : window.scrollY;

		setOpen( true );
	};

	// Prevent scroll to top when modal is opened
	useEffect( () => {
		// Do not scroll on initial render
		if ( isOpen === null ) {
			return;
		}

		if ( isOpen && ! scrollY.current.mobile ) {
			document.body.scrollTo( 0, scrollY.current.y );
		} else if ( ! isOpen ) {
			const element = scrollY.current.mobile ? document.body : window;
			element.scrollTo( 0, scrollY.current.y );
		}
	}, [ isOpen ] );

	const closeModal = () => setOpen( false );
	const translate = useTranslate();

	const handleClick = () => {
		trackStatsAnalyticsEvent( 'utm_builder_opened' );
		trackStatsAnalyticsEvent( 'advanced_feature_interaction', { feature: 'utm_builder' } );

		openModal();
	};

	const triggerNode = trigger ? (
		React.cloneElement( trigger, { onClick: handleClick } )
	) : (
		<Button
			icon={ link }
			className="stats-utm-builder__trigger"
			onClick={ handleClick }
			variant="secondary"
			title={ translate( 'URL Builder' ) }
			aria-label={ translate( 'URL Builder' ) }
		/>
	);

	const isWPAdmin = config.isEnabled( 'is_odyssey' );
	const utmBuilderClasses = clsx( 'stats-utm-builder__overlay', { 'is-odyssey-stats': isWPAdmin } );

	return (
		<>
			{ triggerNode }
			{ isOpen && (
				<Modal
					title={ translate( 'Generate URL' ) }
					onRequestClose={ closeModal }
					overlayClassName={ utmBuilderClasses }
					bodyOpenClassName="stats-utm-builder__body-modal-open"
				>
					<div className={ clsx( modalClassName, 'stats-utm-builder-modal' ) }>
						<div className="stats-utm-builder__fields">
							<div className="stats-utm-builder__description">
								{ translate( 'Generate URLs to share and track UTM parameters.' ) }
							</div>
							<StatsUtmBuilderForm initialData={ initialData } />
						</div>
						<div className="stats-utm-builder__help">
							<div className="stats-utm-builder__help-bg"></div>
							<h2 className="stats-utm-builder__label">
								{ translate( 'Why should I use this?' ) }
							</h2>
							<p className="stats-utm-builder__description">
								{ translate(
									'UTM codes help track where your traffic comes from. Adding them to your URLs gives you insights into what works and where to optimize.'
								) }
							</p>

							<VisuallyHidden>
								<section id="stats-utm-builder-help-section-url">
									<div className="stats-utm-builder__label">{ translate( 'URL' ) }</div>
									<div>{ translate( 'The full URL of the site or post you want to track.' ) }</div>
									<div className="stats-utm-builder__help-section-parameter-example">
										{ translate( 'Example: https://www.my-site.com/2024/11/18/my-post' ) }
									</div>
								</section>
							</VisuallyHidden>

							<section id="stats-utm-builder-help-section-campaign-name">
								<pre className="stats-utm-builder__help-section-parameter">utm_campaign</pre>
								<p>{ translate( 'Name your campaign' ) }</p>
								<p className="stats-utm-builder__help-section-parameter-example">
									{ translate( 'Example: christmas, flash-sale' ) }
								</p>
							</section>

							<section id="stats-utm-builder-help-section-campaign-source">
								<pre className="stats-utm-builder__help-section-parameter">utm_source</pre>
								<p>{ translate( 'Define where traffic originates' ) }</p>
								<p className="stats-utm-builder__help-section-parameter-example">
									{ translate( 'Example: newsletter, facebook, google' ) }
								</p>
							</section>

							<section id="stats-utm-builder-help-section-campaign-medium">
								<pre className="stats-utm-builder__help-section-parameter">utm_medium</pre>
								<p>{ translate( 'Define the channel type' ) }</p>
								<p className="stats-utm-builder__help-section-parameter-example">
									{ translate( 'Example: email, social, cpc' ) }
								</p>
							</section>

							<p>
								{ translate(
									'Use your generated URLs in social posts, emails, or ads. Jetpack Stats will track UTM codes, giving you accurate insights into your traffic.'
								) }
							</p>
						</div>
					</div>
				</Modal>
			) }
		</>
	);
};

export default UTMBuilder;
