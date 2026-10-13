/**
 * PROTOTYPE — proof of concept only.
 *
 * “Your partner manager” card for established agencies at Pro tier and above.
 * Holds the agency tier summary on top, then everything about working with
 * their partner manager (next check-in, discussion notes, next steps, and the
 * last call recap), so the growth plan card can stay a short list of goals.
 */
import { Card, CardBody, CardDivider } from '../../../components/card';
import PartnerManagerHub from './partner-manager-hub';
import type { ComponentProps, ReactNode } from 'react';

type PartnerManagerCardProps = ComponentProps< typeof PartnerManagerHub > & {
	/** Compact tier summary shown above the partner manager section. */
	tierStrip?: ReactNode;
};

export default function PartnerManagerCard( { tierStrip, ...props }: PartnerManagerCardProps ) {
	return (
		<Card>
			{ tierStrip && (
				<>
					<CardBody className="a4a-tier-band">{ tierStrip }</CardBody>
					<CardDivider />
				</>
			) }
			<CardBody>
				<PartnerManagerHub { ...props } />
			</CardBody>
		</Card>
	);
}
