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

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	handleButtonClick: () => void;
}

const MarketingHeader: FunctionComponent< Props > = ( { handleButtonClick } ) => {
	const translate = useTranslate();

	return (
		<Card className="marketing-page-header__body">
			<div className="marketing-page-header__image-wrapper">
				<img
					className="marketing-page-header__image"
					src="/calypso/images/illustrations/illustration-404.svg"
					alt={ translate( 'Your site with Marketing Tools' ) }
				/>
			</div>

			<div className="marketing-page-header__info">
				<h1 className="marketing-page-header__title">
					{ translate( 'Drive more traffic to your site with better SEO' ) }
				</h1>

				<h2 className="marketing-page-header__description">
					{ translate(
						"Optimize your site for search engines and get more exposure for your business. Let's make the most of your site's built-in SEO tools!"
					) }
				</h2>

				<div className="marketing-page-header__button-row">
					<Button onClick={ handleButtonClick } primary>
						{ translate( 'Boost My Traffic' ) }
					</Button>
				</div>
			</div>
		</Card>
	);
};

export default MarketingHeader;
