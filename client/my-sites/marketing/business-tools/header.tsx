/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';

interface Props {
	handleButtonClick: () => void;
}

const MarketingBusinessToolsHeader: FunctionComponent< Props > = ( { handleButtonClick } ) => {
	const translate = useTranslate();

	return (
		<Card className="business-tools__header-body">
			<div className="business-tools__header-image-wrapper">
				<img
					className="business-tools__header-image"
					src="/calypso/images/illustrations/illustration-404.svg"
					alt={ translate( 'Your site with Marketing Tools' ) }
				/>
			</div>

			<div className="business-tools__header-info">
				<h1 className="business-tools__header-title">
					{ translate( 'Grow your business with the latest tools' ) }
				</h1>

				<h2 className="business-tools__header-description">
					{ translate(
						'Improve the efficiency and success of your business with the help other these other products and services. Here are some recommended tools for you.'
					) }
				</h2>
			</div>
		</Card>
	);
};

export default MarketingBusinessToolsHeader;
