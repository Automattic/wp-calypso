import page from '@automattic/calypso-router';
import { Dialog, Gridicon } from '@automattic/components';
import { WpcomPlansUI } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

const DomainUpsellDialog: React.FunctionComponent< {
	domain: string;
} > = ( { domain } ) => {
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, selectedSiteId ) );
	const { setShowDomainUpsellDialog } = useDispatch( WpcomPlansUI.store );
	const isVisible = useSelect( ( select ) => {
		return select( WpcomPlansUI.store ).isDomainUpsellDialogShown();
	}, [] );

	const onCloseDialog = useCallback( () => {
		setShowDomainUpsellDialog( false );
	}, [ setShowDomainUpsellDialog ] );

	const onCancelPlanClick = useCallback( () => {
		onCloseDialog();
		recordTracksEvent( 'calypso_plans_page_domain_upsell_cancel_plan_click' );
		page( '/checkout/' + siteSlug );
	}, [ onCloseDialog, siteSlug ] );

	const onContinuePlanClick = useCallback( () => {
		onCloseDialog();
		recordTracksEvent( 'calypso_plans_page_domain_upsell_continue_plan_click' );
	}, [ onCloseDialog ] );

	const buttons = [
		{ action: 'cancel', label: translate( 'That works for me' ), onClick: onCancelPlanClick },
		{
			action: 'delete',
			label: translate( 'I want my domain as primary' ),
			isPrimary: true,
			onClick: onContinuePlanClick,
		},
	];

	return (
		<Dialog
			additionalClassNames="domain-upsell-dialog"
			isVisible={ isVisible }
			buttons={ buttons }
			onClose={ onCloseDialog }
			shouldCloseOnEsc
		>
			<header className="domain-upsell-dialog__modal-header">
				<button onClick={ onCloseDialog }>
					<Gridicon icon="cross" />
				</button>
			</header>
			<h1>{ translate( 'You need a paid plan to have a primary custom domain' ) }</h1>
			<p>
				{ translate(
					'Any domain you purchase without a plan will get redirected to %(domainName)s.',
					{
						args: {
							domainName: domain,
						},
					}
				) }
			</p>
			<p>
				{ translate(
					'If you upgrade to a plan, you can use your custom domain name instead of having WordPress.com in your URL.'
				) }
			</p>
		</Dialog>
	);
};

export default DomainUpsellDialog;
