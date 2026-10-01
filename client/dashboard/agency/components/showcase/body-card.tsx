import { Button, __experimentalText as Text } from '@wordpress/components';
import { Card, CardBody } from '../../../components/card';
import type { ReactNode } from 'react';

import './accents.scss';
import './body-card.scss';

/**
 * The card under a page's featured showcase (A4AD-237): a 40px tile in the
 * maker's colour, the title with a byline under it, two lines of description,
 * and the actions at the foot. The title is the card's link, so the whole card
 * opens the item while the actions keep their own targets.
 */
export default function BodyCard( {
	title,
	byline,
	description,
	tile,
	actions,
	onOpen,
}: {
	title: string;
	byline: ReactNode;
	description?: string;
	/** The 40px tile beside the title. */
	tile: ReactNode;
	actions?: ReactNode;
	/** Opens the item. Without it the title is plain text. */
	onOpen?: () => void;
} ) {
	return (
		<Card className="dashboard-body-card">
			<CardBody className="dashboard-body-card__body">
				<div className="dashboard-body-card__head">
					{ tile }
					<span className="dashboard-body-card__name">
						{ onOpen ? (
							<Button variant="link" className="dashboard-body-card__title" onClick={ onOpen }>
								{ title }
							</Button>
						) : (
							<Text weight={ 600 } size={ 15 } className="dashboard-body-card__title">
								{ title }
							</Text>
						) }
						<Text variant="muted" size={ 13 }>
							{ byline }
						</Text>
					</span>
				</div>
				{ description && (
					<Text variant="muted" className="dashboard-body-card__description">
						{ description }
					</Text>
				) }
				{ actions && <div className="dashboard-body-card__foot">{ actions }</div> }
			</CardBody>
		</Card>
	);
}
