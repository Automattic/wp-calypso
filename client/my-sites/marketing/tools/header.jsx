/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';

const MarketingToolsHeader = () => {
	const translate = useTranslate();

	return (
		<Card className="tools__header-body">
			<div className="tools__header-image-wrapper">
				<img
					className="tools__header-image"
					src="/calypso/images/illustrations/illustration-404.svg"
					alt={ translate( 'Your site with Marketing Tools' ) }
				/>
			</div>

			<div className="tools__header-info">
				<h1 className="tools__header-title">
					{ translate( 'Drive more traffic to your site with our SEO tools' ) }
				</h1>

				<h2 className="tools__header-description">
					{ translate(
						"Optimize your site for search engines and social media by taking advantage of our SEO tools. We'll nail down important SEO strategies to get more exposure for your business."
					) }
				</h2>

				<div className="tools__header-button-row">
					<Button primary>{ translate( 'Boost my traffic' ) }</Button>
				</div>
			</div>
		</Card>
	);
};

export default MarketingToolsHeader;
