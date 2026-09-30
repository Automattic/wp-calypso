import { Card } from '../../../components/card';
import type { ReactNode } from 'react';

import './accents.scss';
import './body-card.scss';

/**
 * The card under a page's featured showcase (A4AD-237): a 40px tile in the
 * brand's colour, the title with a byline under it, two lines of description,
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
			<div className="dashboard-body-card__body">
				<div className="dashboard-body-card__head">
					{ tile }
					<span className="dashboard-body-card__name">
						{ onOpen ? (
							<button type="button" className="dashboard-body-card__title" onClick={ onOpen }>
								{ title }
							</button>
						) : (
							<span className="dashboard-body-card__title is-static">{ title }</span>
						) }
						<span className="dashboard-body-card__byline">{ byline }</span>
					</span>
				</div>
				{ description && <p className="dashboard-body-card__description">{ description }</p> }
				{ actions && <div className="dashboard-body-card__foot">{ actions }</div> }
			</div>
		</Card>
	);
}
