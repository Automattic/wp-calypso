import config from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import './header.scss';

export default function PlansHeader() {
	const translate = useTranslate();
	// TODO: We need to determine if this is a domain upsell and show the domain here.
	const domainName = 'exampledomain.com';

	const plansDescription = translate(
		'See and compare the features available on each WordPress.com plan.'
	);

	const domainUpsellDescription = translate(
		'With an annual plan, you can get {{strong}}%(domainName)s for free{{/strong}} for the first year, Jetpack essential features, live chat support, and all the features that will take your site to the next level.',
		{
			args: {
				domainName: domainName,
			},
			components: {
				strong: <strong />,
			},
		}
	);

	// TODO: We need to determine if this is a domain upsell.
	const isDomainUpsell = config.isEnabled( 'is_domain_upsell' );

	const onBackClick = () => {
		recordTracksEvent( 'calypso_upgrade_nudge_back_click' );
		history.back();
	};

	const onSkipClick = () => {
		recordTracksEvent( 'calypso_upgrade_nudge_skip_click' );
		// TODO: Connect this to the skip modal.
		alert( 'Skip Clicked' );
	};

	if ( false === isDomainUpsell ) {
		return (
			<FormattedHeader
				brandFont
				headerText={ translate( 'Plans' ) }
				subHeaderText={ plansDescription }
				align="left"
			/>
		);
	}

	return (
		<>
			<header className="formatted-header navigation">
				<Button onClick={ onBackClick } className="inline-help__cancel-button" borderless>
					<Gridicon icon="arrow-left" size={ 18 } />
					{ translate( 'Back' ) }
				</Button>

				{ isDomainUpsell && (
					<Button onClick={ onSkipClick } borderless href="/">
						{ translate( 'Skip' ) }
						<Gridicon icon="arrow-right" size={ 18 } />
					</Button>
				) }
			</header>

			<FormattedHeader
				className="header-text"
				brandFont
				headerText={ translate( 'Free for the first year!' ) }
				subHeaderText={ domainUpsellDescription }
				align="left"
			/>
		</>
	);
}
