import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import BloombergLogo from 'calypso/assets/images/start-with/Bloomberg.svg';
import CNNLogo from 'calypso/assets/images/start-with/CNN.svg';
import CondeNast from 'calypso/assets/images/start-with/Conde_Nast.svg';
import DisneyLogo from 'calypso/assets/images/start-with/Disney.svg';
import MetaLogo from 'calypso/assets/images/start-with/Meta.svg';
import NewsCorpLogo from 'calypso/assets/images/start-with/News_Corp.svg';
import SlackLogo from 'calypso/assets/images/start-with/Slack.svg';
import TechCrunchImage from 'calypso/assets/images/start-with/Tech_Crunch.svg';
import TimeLogo from 'calypso/assets/images/start-with/Time.svg';
import USATodayImage from 'calypso/assets/images/start-with/USA_Today.svg';
import DotcomWooSquareImage from 'calypso/assets/images/start-with/dotcom-woo-square.png';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import './style.scss';

export const StartWithSquarePayments: React.FC = () => {
	const translate = useTranslate();
	const onCTAClick = () => {
		recordTracksEvent( 'calypso_start_with_cta_click', { partner_bundle: 'square_payments' } );
		page( '/setup/entrepreneur/start?partnerBundle=square' );
	};

	return (
		<div className="container">
			<DocumentHead title={ translate( 'Square Payments' ) } />
			<PageViewTracker path="/start-with/square-payments" title="Start with > Square Payments" />
			<div className="content">
				<div className="left-column">
					<h1 className="title">
						{ translate( 'Get Started with WordPress.com and Square Payments' ) }
					</h1>
					<p className="subtitle">
						{ translate(
							'Partnering with Square Payments, WordPress.com offers you an easy way to build and manage your online store. Click below to begin your quick and easy setup process.'
						) }
					</p>
					<Button className="start-store-cta" onClick={ onCTAClick }>
						{ translate( 'Start your store now' ) }
					</Button>
				</div>
				<div className="right-column">
					<img
						src={ DotcomWooSquareImage }
						alt={ translate( 'WordPress.com, Square and Woocommerce partneship logo' ) }
					/>
				</div>
			</div>
			<footer className="footer">
				<div className="text">{ translate( 'Trusted by 160 million worldwide' ) }</div>
				<div className="brands">
					<div className="brands-container">
						<img src={ TimeLogo } alt={ translate( 'Time Logo' ) } />
						<img src={ DisneyLogo } alt={ translate( 'Disney Logo' ) } />
						<img src={ SlackLogo } alt={ translate( 'Slack Logo' ) } />
						<img src={ CNNLogo } alt={ translate( 'CNN Logo' ) } />
						<img src={ TechCrunchImage } alt={ translate( 'Tech Crunch Logo' ) } />
						<img src={ USATodayImage } alt={ translate( 'USA Today Sports Logo' ) } />
						<img src={ BloombergLogo } alt={ translate( 'Bloomberg Logo' ) } />
						<img src={ MetaLogo } alt={ translate( 'Meta Logo' ) } />
						<img src={ NewsCorpLogo } alt={ translate( 'News Corp Logo' ) } />
						<img src={ CondeNast } alt={ translate( 'Conde Nast Logo' ) } />
					</div>
				</div>
			</footer>
		</div>
	);
};
