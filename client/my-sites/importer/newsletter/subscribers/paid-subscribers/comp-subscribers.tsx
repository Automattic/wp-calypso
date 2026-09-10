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
 * @param availableTiers Tiers as returned by the importer endpoint.
 */
export function groupCompTiers( availableTiers: Product[] = [] ): Product[] {
	const tiersByAnchor = new Map< number, Product >();

	availableTiers.forEach( ( product ) => {
		const anchorId = product.tier || product.id;
		const existing = tiersByAnchor.get( anchorId );

		if ( ! existing || ( ! product.tier && existing.tier ) ) {
			tiersByAnchor.set( anchorId, { ...product, id: anchorId } );
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
