import { isEnabled } from '@automattic/calypso-config';
import { Button, Dialog, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './header.scss';

export default function PlansHeader() {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, selectedSiteId ) );
	const translate = useTranslate();
	const [ showDomainUpsellDialog, setShowDomainUpsellDialog ] = useState( false );
	const is2023OnboardingPricingGrid = isEnabled( 'onboarding/2023-pricing-grid' );
	const domainFromHomeUpsellFlow = new URLSearchParams( window.location.search ).get(
		'get_domain'
	);

	const plansDescription = translate(
		'See and compare the features available on each WordPress.com plan.'
	);

	const onCloseDialog = () => {
		setShowDomainUpsellDialog( false );
	};

	const onSkipClick = ( event ) => {
		event.preventDefault();
		recordTracksEvent( 'calypso_plans_page_domain_upsell_skip_click' );
		setShowDomainUpsellDialog( true );
	};

	const onCancelPlanClick = () => {
		setShowDomainUpsellDialog( false );
		recordTracksEvent( 'calypso_plans_page_domain_upsell_cancel_plan_click' );
		page( '/checkout/' + siteSlug );
	};

	const onContinuePlanClick = () => {
		setShowDomainUpsellDialog( false );
		recordTracksEvent( 'calypso_plans_page_domain_upsell_continue_plan_click' );
	};

	function renderDeleteDialog() {
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
				isVisible={ showDomainUpsellDialog }
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
								domainName: domainFromHomeUpsellFlow,
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
	}

	if ( null === domainFromHomeUpsellFlow ) {
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
	const withSkipButton = ! is2023OnboardingPricingGrid;
	const classes = classNames( 'plans__section-header', 'modernized-header', 'header-text', {
		'with-skip-button': withSkipButton,
	} );

	return (
		<>
			{ renderDeleteDialog() }
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
}
