import { is2023PricingGridEnabled } from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import { WpcomPlansUI } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import './style.scss';

const DomainUpsellHeader: React.FunctionComponent = () => {
	const { setShowDomainUpsellDialog } = useDispatch( WpcomPlansUI.store );
	const translate = useTranslate();
	const is2023OnboardingPricingGrid = is2023PricingGridEnabled();
	const plansDescription = translate(
		'See and compare the features available on each WordPress.com plan.'
	);
	const withSkipButton = ! is2023OnboardingPricingGrid;
	const classes = classNames(
		'plans__formatted-header',
		'plans__section-header',
		'modernized-header',
		'header-text',
		{
			'with-skip-button': withSkipButton,
		}
	);

	const onSkipClick = useCallback(
		( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
			event.preventDefault();
			recordTracksEvent( 'calypso_plans_page_domain_upsell_skip_click' );
			setShowDomainUpsellDialog( true );
		},
		[ setShowDomainUpsellDialog ]
	);

	return (
		<>
			<FormattedHeader
				className={ classes }
				brandFont
				headerText={ translate( 'Plans' ) }
				subHeaderText={ plansDescription }
				align="left"
			>
				{ withSkipButton && (
					<Button className="plans__section-header-skip-button" onClick={ onSkipClick } href="/">
						{ translate( 'Skip' ) }
						<Gridicon icon="arrow-right" size={ 18 } />
					</Button>
				) }
			</FormattedHeader>
		</>
	);
};

const PlansHeader: React.FunctionComponent< {
	domainFromHomeUpsellFlow?: string;
} > = ( { domainFromHomeUpsellFlow } ) => {
	const translate = useTranslate();
	const plansDescription = translate(
		'See and compare the features available on each WordPress.com plan.'
	);

	if ( domainFromHomeUpsellFlow ) {
		return <DomainUpsellHeader />;
	}

	return (
		<FormattedHeader
			className="plans__formatted-header plans__section-header modernized-header"
			brandFont
			headerText={ translate( 'Plans' ) }
			subHeaderText={ plansDescription }
			align="left"
		/>
	);
};

export default PlansHeader;
