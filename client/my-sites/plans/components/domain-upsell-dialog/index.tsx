import { Dialog, Gridicon } from '@automattic/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { PLANS_UI_STORE } from '../../store';
import './style.scss';

const DomainUpsellDialog: React.FunctionComponent< {
	domain: string;
} > = ( { domain } ) => {
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, selectedSiteId ) );
	const { setShowDomainUpsellDialog } = useDispatch( PLANS_UI_STORE );
	const visible = useSelect( ( select ) => {
		return select( PLANS_UI_STORE ).isDomainUpsellDialogShown();
	} );

	const onCloseDialog = useCallback( () => {
		// onClose();
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
			isVisible={ visible }
			buttons={ buttons }
			onClose={ onCloseDialog }
			shouldCloseOnEsc={ true }
		>
			<header className="domain-upsell-dialog__modal-header">
				<button onClick={ onCloseDialog }>
					<Gridicon icon="cross" />
				</button>
			</header>
			<h1>{ translate( 'You need a plan to have a primary custom domain' ) }</h1>
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
