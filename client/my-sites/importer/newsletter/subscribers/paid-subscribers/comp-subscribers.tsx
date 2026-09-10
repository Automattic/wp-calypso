import { Notice } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import {
	Product,
	SubscribersStepContent,
} from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { useSetCompPlanMutation } from 'calypso/data/paid-newsletter/use-set-comp-plan-mutation';
import { MapCompPlan } from './map-comp-plan';

/**
 * Newsletter tiers arrive as a monthly/yearly pair: the yearly entry points at the monthly
 * anchor through `tier`, and the anchor carries `tier: 0`. A comp attaches to the tier as a
 * whole, so collapse each pair into a single choice keyed on the anchor id.
 *
 * The endpoint returns `price` as a string, so its ids cannot be assumed to be numbers either.
 * Everything is normalized to a number here so the grouping and the later selection lookup
 * compare in the same representation.
 * @param availableTiers Tiers as returned by the importer endpoint.
 */
export function groupCompTiers( availableTiers?: Product[] ): Product[] {
	if ( ! Array.isArray( availableTiers ) ) {
		return [];
	}

	const tiersByAnchor = new Map< number, Product >();
	// A deleted monthly anchor leaves its yearly half behind, still pointing at the id that went
	// away, so the back-reference is only worth following when the anchor is still in the list.
	// The server grants against the survivor's own id in that case.
	const presentIds = new Set( availableTiers.map( ( product ) => Number( product.id ) ) );

	availableTiers.forEach( ( product ) => {
		const tier = Number( product.tier ) || 0;
		const anchorId = tier && presentIds.has( tier ) ? tier : Number( product.id );

		if ( ! Number.isFinite( anchorId ) ) {
			return;
		}

		const existing = tiersByAnchor.get( anchorId );

		// Prefer the anchor, whichever order the pair arrives in, so the label and price are monthly.
		if ( ! existing || ( anchorId === Number( product.id ) && existing.tier !== 0 ) ) {
			tiersByAnchor.set( anchorId, { ...product, id: anchorId, tier } );
		}
	} );

	return Array.from( tiersByAnchor.values() );
}

export function getCompCount( cardData?: SubscribersStepContent ): number {
	return Number( cardData?.meta?.comp_count ?? 0 ) || 0;
}

/**
 * The tier a comp will be granted against, as a string for the picker. Falls back to the only
 * tier on the site, which is what the server grants against when nothing has been chosen.
 * @param cardData The subscribers step content.
 */
export function getSelectedCompTierId( cardData?: SubscribersStepContent ): string {
	const tiers = groupCompTiers( cardData?.available_tiers );
	const selectedId = cardData?.comp_product_id;

	if ( selectedId && tiers.some( ( tier ) => tier.id === Number( selectedId ) ) ) {
		return selectedId.toString();
	}

	return tiers.length === 1 ? tiers[ 0 ].id.toString() : '';
}

/**
 * Whether the import can go ahead as far as comped subscribers are concerned. A site with no
 * tier at all is warned rather than blocked, since setting one up needs Stripe and free
 * subscribers should still be importable.
 * @param cardData The subscribers step content.
 */
export function isCompSelectionSatisfied( cardData?: SubscribersStepContent ): boolean {
	if ( getCompCount( cardData ) === 0 ) {
		return true;
	}

	if ( groupCompTiers( cardData?.available_tiers ).length === 0 ) {
		return true;
	}

	return getSelectedCompTierId( cardData ) !== '';
}

type CompSubscribersProps = {
	cardData: SubscribersStepContent;
	siteId: number;
	engine: string;
};

export default function CompSubscribers( { cardData, siteId, engine }: CompSubscribersProps ) {
	const { _n } = useI18n();
	const { setCompPlan } = useSetCompPlanMutation();

	const compCount = getCompCount( cardData );
	if ( compCount === 0 ) {
		return null;
	}

	const tiers = groupCompTiers( cardData?.available_tiers );

	if ( tiers.length === 0 ) {
		return (
			<Notice isDismissible={ false } status="warning">
				{ sprintf(
					// Translators: %d is number of complimentary subscribers
					_n(
						'%d subscriber won’t be comped unless you set up a paid tier.',
						'%d subscribers won’t be comped unless you set up a paid tier.',
						compCount
					),
					compCount
				) }
			</Notice>
		);
	}

	return (
		<MapCompPlan
			compCount={ compCount }
			tiers={ tiers }
			selectedTierId={ getSelectedCompTierId( cardData ) }
			onCompPlanSelect={ ( tierId ) => setCompPlan( siteId, engine, 'subscribers', tierId ) }
		/>
	);
}
