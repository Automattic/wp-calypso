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
import MarketingFeature from './feature';
import MarketingHeader from './header';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	recordTracksEvent: typeof recordTracksEventAction;
}

export const HireAProPage: FunctionComponent< Props > = ( { recordTracksEvent } ) => {
	const translate = useTranslate();

	const handleGeneralClick = () => {
		recordTracksEvent( 'calypso_hire_a_pro_general_button_click' );
	};

	const handleDesignClick = () => {
		recordTracksEvent( 'calypso_hire_a_pro_design_button_click' );
	};

	const handleSeoClick = () => {
		recordTracksEvent( 'calypso_hire_a_pro_seo_button_click' );
	};

	const handleCopyWriterClick = () => {
		recordTracksEvent( 'calypso_hire_a_pro_copy_writer_button_click' );
	};

	const handleHeaderBannerClick = () => {
		recordTracksEvent( 'calypso_hire_a_pro_banner_button_click' );
	};

	return (
		<Main wideLayout className="hire-a-pro__container">
			<PageViewTracker path="/hire-a-pro/:site" title="Hire a Pro" />
			<DocumentHead title={ translate( 'Sharing' ) } />
			<Fragment>
				<MarketingHeader handleButtonClick={ handleHeaderBannerClick } />
				<div className="hire-a-pro__feature-list">
					<MarketingFeature
						title={ translate( 'General Frelancer' ) }
						description={ translate( 'Lorem Ipsum' ) }
						imagePath="/calypso/images/marketing/looka-logo.svg"
					>
						<Button compact onClick={ handleGeneralClick } href={ '#' } target="_blank">
							{ translate( 'Hire A Freelancer' ) }
						</Button>
					</MarketingFeature>

					<MarketingFeature
						title={ translate( 'General Frelancer' ) }
						description={ translate( 'Lorem Ipsum' ) }
						imagePath="/calypso/images/marketing/looka-logo.svg"
					>
						<Button compact onClick={ handleDesignClick } href={ '#' } target="_blank">
							{ translate( 'Hire A Designer' ) }
						</Button>
					</MarketingFeature>

					<MarketingFeature
						title={ translate( 'General Frelancer' ) }
						description={ translate( 'Lorem Ipsum' ) }
						imagePath="/calypso/images/marketing/looka-logo.svg"
					>
						<Button compact onClick={ handleSeoClick } href={ '#' } target="_blank">
							{ translate( 'Hire A SEO Exper' ) }
						</Button>
					</MarketingFeature>

					<MarketingFeature
						title={ translate( 'General Frelancer' ) }
						description={ translate( 'Lorem Ipsum' ) }
						imagePath="/calypso/images/marketing/looka-logo.svg"
					>
						<Button compact onClick={ handleCopyWriterClick } href={ '#' } target="_blank">
							{ translate( 'Hire A Writer' ) }
						</Button>
					</MarketingFeature>
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
