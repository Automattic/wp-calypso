import { isEnabled } from '@automattic/calypso-config';
import { Button, Dialog, Gridicon } from '@automattic/components';
import { useCallback, useState } from '@wordpress/element';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './header.scss';

const DomainUpsellDialog: React.FunctionComponent< {
	visible: boolean;
	onClose: () => void;
	domain: string;
} > = ( { visible, onClose, domain } ) => {
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, selectedSiteId ) );

	const onCloseDialog = useCallback( () => {
		onClose();
	}, [ onClose ] );

	const onCancelPlanClick = useCallback( () => {
		onClose();
		recordTracksEvent( 'calypso_plans_page_domain_upsell_cancel_plan_click' );
		page( '/checkout/' + siteSlug );
	}, [ onClose, siteSlug ] );

	const onContinuePlanClick = useCallback( () => {
		onClose();
		recordTracksEvent( 'calypso_plans_page_domain_upsell_continue_plan_click' );
	}, [ onClose ] );

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
			additionalClassNames="planspage__domain-upsell"
			isVisible={ visible }
			buttons={ buttons }
			onClose={ onCloseDialog }
			shouldCloseOnEsc={ true }
		>
			<header className="domain-upsell__modal-header">
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

const DomainUpsellHeader: React.FunctionComponent< { domain: string } > = ( { domain } ) => {
	const translate = useTranslate();
	const [ showDomainUpsellDialog, setShowDomainUpsellDialog ] = useState( false );
	const is2023OnboardingPricingGrid = isEnabled( 'onboarding/2023-pricing-grid' );
	const plansDescription = translate(
		'See and compare the features available on each WordPress.com plan.'
	);
	const withSkipButton = ! is2023OnboardingPricingGrid;
	const classes = classNames( 'plans__section-header', 'modernized-header', 'header-text', {
		'with-skip-button': withSkipButton,
	} );

	const handleCloseDialog = useCallback( () => {
		setShowDomainUpsellDialog( false );
	}, [] );

	const handleOpenDialog = useCallback( () => {
		setShowDomainUpsellDialog( true );
	}, [] );

	const onSkipClick = useCallback(
		( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
			event.preventDefault();
			recordTracksEvent( 'calypso_plans_page_domain_upsell_skip_click' );
			handleOpenDialog();
		},
		[ handleOpenDialog ]
	);

	return (
		<>
			<DomainUpsellDialog
				visible={ showDomainUpsellDialog }
				onClose={ handleCloseDialog }
				domain={ domain }
			/>
			<FormattedHeader
				className={ classes }
				brandFont
				headerText={ translate( 'Plans' ) }
				subHeaderText={ plansDescription }
				align="left"
			>
				{ withSkipButton && (
					<div className="plans__section-header-navigation">
						<Button onClick={ onSkipClick } borderless href="/">
							{ translate( 'Skip' ) }
							<Gridicon icon="arrow-right" size={ 18 } />
						</Button>
					</div>
				) }
			</FormattedHeader>
		</>
	);
};

const PlansHeader: React.FunctionComponent< { domainFromHomeUpsellFlow?: string } > = ( {
	domainFromHomeUpsellFlow,
} ) => {
	const translate = useTranslate();
	const plansDescription = translate(
		'See and compare the features available on each WordPress.com plan.'
	);

	if ( ! domainFromHomeUpsellFlow ) {
		return (
			<FormattedHeader
				className="plans__section-header modernized-header"
				brandFont
				headerText={ translate( 'Plans' ) }
				subHeaderText={ plansDescription }
				align="left"
			/>
		);
	}

	return <DomainUpsellHeader domain={ domainFromHomeUpsellFlow } />;
};

export default PlansHeader;
