/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { Fragment, FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import MarketingPageFeature from 'components/marketing-page-feature';
import MarketingPageHeader from 'components/marketing-page-header';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

interface ConnectedProps {
	recordTracksEvent: typeof recordTracksEventAction;
}

export const HireAProPage: FunctionComponent< ConnectedProps > = ( { recordTracksEvent } ) => {
	const translate = useTranslate();

	const handleHeaderBannerClick = () => {
		recordTracksEvent( 'calypso_hire_a_pro_banner_button_click' );
	};

	const handleDesignerClick = () => {
		recordTracksEvent( 'calypso_hire_a_pro_design_button_click' );
	};

	const handleLogoDesignerClick = () => {
		recordTracksEvent( 'calypso_hire_a_pro_general_button_click' );
	};

	const handleSeoClick = () => {
		recordTracksEvent( 'calypso_hire_a_pro_seo_button_click' );
	};

	const handleCopyWriterClick = () => {
		recordTracksEvent( 'calypso_hire_a_pro_copy_writer_button_click' );
	};

	return (
		<Main wideLayout className="hire-a-pro__container">
			<PageViewTracker path="/hire-a-pro/:site" title="Hire a Pro" />
			<DocumentHead title={ translate( 'Sharing' ) } />
			<Fragment>
				<MarketingPageHeader
					buttonCopy={ translate( 'Find your pro' ) }
					description={ translate(
						'Site setup, graphic design, SEO, social media — whatever you need help with, there’s a pro for you. And every partner we recommend offers great service and support.'
					) }
					handleButtonClick={ handleHeaderBannerClick }
					illustrationAlt={ translate( 'Hire a WordPress.com pro' ) }
					illustrationUrl={ '/calypso/images/illustrations/pro.svg' }
					title={ translate( 'Hire the perfect pro from our trusted partners' ) }
				/>
				<div className="hire-a-pro__feature-list">
					<MarketingPageFeature
						title={ translate( 'Website Designers' ) }
						description={ translate(
							'Ripe Concept’s pool of talented designers can tweak your existing layout or design a new one from scratch.'
						) }
						imagePath="/calypso/images/illustrations/designers.svg"
					>
						<Button compact onClick={ handleDesignerClick } href={ '#' } target="_blank">
							{ translate( 'Hire a designer' ) }
						</Button>
					</MarketingPageFeature>

					<MarketingPageFeature
						title={ translate( 'Logo Designers' ) }
						description={ translate(
							'A custom logo makes your site memorable. Looka’s stable of artists is here to help you create the next Nike swoosh (or WordPress W!).'
						) }
						imagePath="/calypso/images/illustrations/logo-designers.svg"
					>
						<Button
							compact
							onClick={ handleLogoDesignerClick }
							href={ 'http://logojoy.grsm.io/looka' }
							target="_blank"
						>
							{ translate( 'Hire an logo designer' ) }
						</Button>
					</MarketingPageFeature>

					<MarketingPageFeature
						title={ translate( 'SEO Experts' ) }
						description={ translate(
							'Solid SEO is key to increasing traffic. Find an expert to improve your Google search rankings and watch your online presence grow.'
						) }
						imagePath="/calypso/images/illustrations/seo-experts.svg"
					>
						<Button compact onClick={ handleSeoClick } href={ '#' } target="_blank">
							{ translate( 'Hire an SEO expert' ) }
						</Button>
					</MarketingPageFeature>

					<MarketingPageFeature
						title={ translate( 'Writers and Editors' ) }
						description={ translate(
							'Your visitors want something great to read! Work with a writer from Fiverr to load your site with compelling posts and pages.'
						) }
						imagePath="/calypso/images/illustrations/writers.svg"
					>
						<Button compact onClick={ handleCopyWriterClick } href={ '#' } target="_blank">
							{ translate( 'Hire a writer' ) }
						</Button>
					</MarketingPageFeature>
				</div>
			</Fragment>
		</Main>
	);
};

export default connect(
	null,
	{
		recordTracksEvent: recordTracksEventAction,
	}
)( HireAProPage );
