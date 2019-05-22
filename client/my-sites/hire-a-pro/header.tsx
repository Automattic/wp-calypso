/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';

interface Props {
	handleButtonClick: () => void;
}

const MarketingHeader: FunctionComponent< Props > = ( { handleButtonClick } ) => {
	const translate = useTranslate();

	return (
		<Card className="hire-a-pro__header-body">
			<div className="hire-a-pro__header-image-wrapper">
				<img
					className="hire-a-pro__header-image"
					src="/calypso/images/illustrations/illustration-404.svg"
					alt={ translate( 'Your site with Marketing Tools' ) }
				/>
			</div>

			<div className="hire-a-pro__header-info">
				<h1 className="hire-a-pro__header-title">
					{ translate( 'Drive more traffic to your site with better SEO' ) }
				</h1>

				<h2 className="hire-a-pro__header-description">
					{ translate(
						"Optimize your site for search engines and get more exposure for your business. Let's make the most of your site's built-in SEO tools!"
					) }
				</h2>

				<div className="hire-a-pro__header-button-row">
					<Button onClick={ handleButtonClick } primary>
						{ translate( 'Boost My Traffic' ) }
					</Button>
				</div>
			</div>
		</Card>
	);
};

export default MarketingHeader;
