import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import { HelpCenter, HelpCenterSelect } from '@automattic/data-stores';
import { useProductsWithPremiumSupport } from '@automattic/help-center/src/hooks';
import { useShoppingCart } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDataStoreSelect,
} from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const HELP_CENTER_STORE = HelpCenter.register();

const ContactContainer = styled.div`
	display: flex;
	align-items: center;
	column-gap: 8px;
	font-size: 14px;
	line-height: 20px;
	font-weight: 500;
	label {
		color: var( --studio-gray-60 );
	}
	button.thank-you-help-center {
		text-decoration: underline;
		line-height: 20px;
		font-size: 14px;

		span {
			color: var( --studio-wordpress-blue );
		}

		&:hover {
			text-decoration: none;
		}
	}
	.gridicon {
		display: block;
		fill: var( --studio-gray-60 );
	}
	label,
	span {
		display: none;
	}

	@media ( min-width: 600px ) {
		.gridicon {
			display: none;
		}
		label,
		span {
			display: block;
		}
	}
`;

export function DefaultMasterbarContact() {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const translate = useTranslate();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );

	const { hasPremiumSupport, initialMessage } = useProductsWithPremiumSupport(
		responseCart.products
	);
	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HELP_CENTER_STORE );

	const isShowingHelpCenter = useDataStoreSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const toggleHelpCenter = () => {
		recordTracksEvent( `calypso_thank_you_inlinehelp_${ isShowingHelpCenter ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'thank-you-help-center',
		} );

		if ( hasPremiumSupport ) {
			setShowHelpCenter( ! isShowingHelpCenter, hasPremiumSupport );
			setNavigateToRoute(
				`/odie?provider=zendesk&userFieldMessage=${ initialMessage }&siteUrl=${ siteSlug }&siteId=${ siteId }`
			);
		} else {
			setShowHelpCenter( ! isShowingHelpCenter, hasPremiumSupport );
		}
	};

	useEffect( () => {
		return () => {
			setShowHelpCenter( false );
		};
	}, [] );

	return (
		<ContactContainer>
			<label>{ translate( 'Need extra help?' ) }</label>
			<Button className="thank-you-help-center" variant="link" onClick={ toggleHelpCenter }>
				<Gridicon icon="help-outline" />
				<span>{ translate( 'Visit Help Center' ) }</span>
			</Button>
		</ContactContainer>
	);
}
