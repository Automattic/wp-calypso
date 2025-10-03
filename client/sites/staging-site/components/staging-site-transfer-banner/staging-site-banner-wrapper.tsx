import { Card, CardBody } from '@wordpress/components';
import { ReactNode } from 'react';
import stagingSiteTransferBackground from './staging-site-transfer-banner-background.svg';

type StagingSiteBannerWrapperProps = {
	children: ReactNode;
};

export function StagingSiteBannerWrapper( { children }: StagingSiteBannerWrapperProps ) {
	return (
		<Card
			style={ {
				margin: '40px',
			} }
		>
			<CardBody
				style={ {
					padding: '40px',
					background: `
						linear-gradient(
							to right,
							rgba( 255, 255, 255, 1 ) 0%,
							rgba( 255, 255, 255, 0.41 ) 59%,
							rgba( 255, 255, 255, 0 ) 100%
						),
						url(${ stagingSiteTransferBackground }) repeat
					`,
				} }
			>
				{ children }
			</CardBody>
		</Card>
	);
}
