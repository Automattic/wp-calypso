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

const MarketingToolsHeader: FunctionComponent< Props > = ( { handleButtonClick } ) => {
	const translate = useTranslate();

	return (
		<Card className="tools__header-body">
			<div className="tools__header-image-wrapper">
				<img
					className="tools__header-image"
					src="/calypso/images/illustrations/illustration-404.svg"
					alt={ translate( 'Marketing Tools' ) }
				/>
			</div>

			<div className="tools__header-info">
				<h1 className="tools__header-title">
					{ translate( 'Explore our business tools marketplace' ) }
				</h1>

				<h2 className="tools__header-description">
					{ translate(
						'From finance services to productivity apps and marketing tools, our Business Tool hub includes hand-picked services that we think can help you grow your business.'
					) }
				</h2>

				<div className="tools__header-button-row">
					<Button onClick={ handleButtonClick } primary>
						{ translate( 'Find new tools' ) }
					</Button>
				</div>
			</div>
		</Card>
	);
};

export default MarketingToolsHeader;
