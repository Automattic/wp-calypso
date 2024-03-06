import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
	LayoutHeaderSubtitle as Subtitle,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_PAYMENT_METHODS_ADD_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function PaymentMethodOverview() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const title = translate( 'Payment Methods' );

	const onAddNewCardClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_payments_add_new_card_button_click' ) );
	};

	const allowAddNewCard = true; // FIXME: Need to determine based on current fetching state and number of available cards.

	return (
		<Layout
			className="payment-method-overview"
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<PageViewTracker title="Purchases > Payment Methods" path="/purchases/payment-methods" />

			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
					<Subtitle>
						{ translate( "Add a payment method to issue licenses. It's auto-charged monthly." ) }
					</Subtitle>
					<Actions>
						{ allowAddNewCard && (
							<Button href={ A4A_PAYMENT_METHODS_ADD_LINK } onClick={ onAddNewCardClick } primary>
								{ translate( 'Add new card' ) }
							</Button>
						) }
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>Payment Method List</LayoutBody>
		</Layout>
	);
}
