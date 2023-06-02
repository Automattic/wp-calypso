import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';

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
					src="/calypso/images/illustrations/illustration-marketing-tools.svg"
					alt={ String( translate( 'Marketing Tools' ) ) }
				/>
			</div>

			<div className="tools__header-info">
				<h1 className="tools__header-title">{ translate( 'Explore our premium plugins' ) }</h1>

				<h2 className="tools__header-description">
					{ translate(
						"We've added premium plugins to boost your site's capabilities. From bookings and subscriptions to email marketing and SEO tools, we have you covered."
					) }
				</h2>

				<div className="tools__header-button-row">
					<Button onClick={ handleButtonClick } primary>
						{ translate( 'Explore now' ) }
					</Button>
				</div>
			</div>
		</Card>
	);
};

export default MarketingToolsHeader;
