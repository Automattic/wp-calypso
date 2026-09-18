import { freeSuggestionQuery } from '@automattic/api-queries';
import { Badge } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import { Card, CardBody, __experimentalText as Text } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, chevronRight, globe } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import DocumentHead from 'calypso/components/data/document-head';
import { useStaticSiteImportSource } from '../components/static-site-import';
import type { Step as StepType } from '../../types';

import './style.scss';

export type StaticSiteImportDomainChoice = 'keep' | 'free' | 'register';

export type StaticSiteImportAddressSubmits = {
	domainChoice: StaticSiteImportDomainChoice;
	siteUrl?: string;
};

const StaticSiteImportAddress: StepType< {
	submits: StaticSiteImportAddressSubmits;
} > = function StaticSiteImportAddress( { navigation } ) {
	const { __ } = useI18n();
	const { host } = useStaticSiteImportSource();
	const { data: freeSuggestion } = useQuery( {
		...freeSuggestionQuery( host.split( '.' )[ 0 ], { only_wordpressdotcom: true } ),
		enabled: Boolean( host ),
	} );
	const freeAddress = freeSuggestion?.domain_name;

	const options: {
		value: StaticSiteImportDomainChoice;
		title: string;
		text: string;
		badge?: string;
	}[] = [
		...( host
			? [
					{
						value: 'keep' as const,
						title: sprintf(
							/* translators: %s: the domain the site uses today, e.g. example.com. */
							__( 'Keep %s' ),
							host
						),
						text: __(
							'Your address stays the same and starts showing your new site. Needs a paid plan.'
						),
						badge: __( 'Recommended' ),
					},
				]
			: [] ),
		{
			value: 'free',
			title: freeAddress
				? sprintf(
						/* translators: %s: a free WordPress.com address, e.g. yoursite.wordpress.com. */
						__( 'Use %s' ),
						freeAddress
					)
				: __( 'Use a free WordPress.com address' ),
			text: __( 'Free forever. You can connect a custom domain whenever you’re ready.' ),
		},
		{
			value: 'register',
			title: __( 'Register a new domain name' ),
			text: __( 'Pick a fresh address. Free for the first year with any annual paid plan.' ),
		},
	];

	const subText = host
		? createInterpolateElement(
				sprintf(
					/* translators: %s: the domain the site uses today, e.g. example.com. */
					__( 'Bring %s with you, or<br />start with a free address and connect it later.' ),
					host
				),
				{ br: <br /> }
			)
		: __( 'Start with a free address and connect a domain later, or register a new one.' );

	return (
		<>
			<DocumentHead title={ __( 'Keep or change your address' ) } />
			<Step.CenteredColumnLayout
				className="step-container-v2--static-site-import-address"
				columnWidth={ 8 }
				topBar={
					<Step.TopBar
						leftElement={
							navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
						}
					/>
				}
				heading={
					<Step.Heading text={ __( 'Keep or change your address' ) } subText={ subText } />
				}
			>
				<Card>
					<CardBody size="large" className="static-site-import-address__options">
						{ options.map( ( option ) => (
							<button
								key={ option.value }
								type="button"
								className="static-site-import-address__option"
								onClick={ () =>
									navigation.submit?.( {
										domainChoice: option.value,
										siteUrl: option.value === 'free' ? freeAddress : undefined,
									} )
								}
							>
								<Icon className="static-site-import-address__icon" icon={ globe } size={ 24 } />
								<span className="static-site-import-address__text">
									<span className="static-site-import-address__title">
										{ option.title }
										{ option.badge && <Badge type="info-green">{ option.badge }</Badge> }
									</span>
									<Text variant="muted">{ option.text }</Text>
								</span>
								<Icon
									className="static-site-import-address__icon"
									icon={ chevronRight }
									size={ 24 }
								/>
							</button>
						) ) }
					</CardBody>
				</Card>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default StaticSiteImportAddress;
