import page from '@automattic/calypso-router';
import { PlanPrice } from '@automattic/components';
import {
	Button,
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon, audio, check, layout, megaphone } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export type PlanTier = 'free' | 'personal' | 'premium' | 'business';

interface WelcomeProps {
	planTier: PlanTier;
}

interface PlanDef {
	slug: 'personal' | 'premium' | 'business';
	name: string;
	blurb: string;
	price: number;
	features: string[];
}

type Translate = ReturnType< typeof useTranslate >;

const getPlans = (
	translate: Translate
): Record< 'personal' | 'premium' | 'business', PlanDef > => ( {
	personal: {
		slug: 'personal',
		name: translate( 'Personal' ) as string,
		blurb: translate( 'Run a real podcast with native tools and stats.' ) as string,
		price: 4,
		features: [
			translate( 'Audio upload to WordPress.com' ) as string,
			translate( 'Podcast dashboard' ) as string,
			translate( 'Native podcast stats' ) as string,
			translate( 'Episode block' ) as string,
			translate( 'Episode scaffolding on publish' ) as string,
		],
	},
	premium: {
		slug: 'premium',
		name: translate( 'Premium' ) as string,
		blurb: translate( 'Add AI tools and self-hosted video to your show.' ) as string,
		price: 8,
		features: [
			translate( 'AI-generated show notes' ) as string,
			translate( 'Auto transcripts' ) as string,
			translate( 'Chapter markers' ) as string,
			translate( 'Self-hosted video with VideoPress' ) as string,
		],
	},
	business: {
		slug: 'business',
		name: translate( 'Business' ) as string,
		blurb: translate( 'Scale your podcast with full hosting and developer tools.' ) as string,
		price: 25,
		features: [
			translate( '50 GB storage upgrade' ) as string,
			translate( 'Priority 24/7 support' ) as string,
			translate( 'SFTP, WP-CLI, and GitHub Deployments' ) as string,
		],
	},
} );

// Show the user's plan + the next one up. Free sees Personal + Premium (Recommended).
// On paid plans the upgrade target is shown without a "Recommended" push.
// Business sees only Business.
function getPlanCards(
	tier: PlanTier,
	plans: Record< 'personal' | 'premium' | 'business', PlanDef >
): { plan: PlanDef; label: 'your-plan' | 'recommended' | null }[] {
	if ( tier === 'free' ) {
		return [
			{ plan: plans.personal, label: null },
			{ plan: plans.premium, label: 'recommended' },
		];
	}
	if ( tier === 'personal' ) {
		return [
			{ plan: plans.personal, label: 'your-plan' },
			{ plan: plans.premium, label: null },
		];
	}
	if ( tier === 'premium' ) {
		return [
			{ plan: plans.premium, label: 'your-plan' },
			{ plan: plans.business, label: null },
		];
	}
	return [ { plan: plans.business, label: 'your-plan' } ];
}

const getBenefits = (
	translate: Translate
): { icon: React.ReactNode; title: string; body: string }[] => [
	{
		icon: <Icon icon={ megaphone } />,
		title: translate( 'Reach listeners in every app' ) as string,
		body: translate(
			'One feed distributes to Apple Podcasts, Spotify, Overcast, Pocket Casts, and every directory that accepts RSS.'
		) as string,
	},
	{
		icon: <Icon icon={ audio } />,
		title: translate( 'Works with the editor you already use' ) as string,
		body: translate(
			'Drop an audio block into a post, assign the podcast category, hit publish. That is the whole workflow.'
		) as string,
	},
	{
		icon: <Icon icon={ layout } />,
		title: translate( 'One home for writing, email, and audio' ) as string,
		body: translate(
			'One site, one audience, one subscriber list. Your posts, newsletters, and episodes all live in the same place.'
		) as string,
	},
];

const getSteps = ( translate: Translate ): { number: string; title: string; body: string }[] => [
	{
		number: '1',
		title: translate( 'Pick a category' ) as string,
		body: translate( 'Choose or create the category that holds your episodes.' ) as string,
	},
	{
		number: '2',
		title: translate( 'Publish a post with audio' ) as string,
		body: translate(
			'Add an audio block to any post and assign it to your podcast category.'
		) as string,
	},
	{
		number: '3',
		title: translate( 'Submit your feed once' ) as string,
		body: translate(
			'Copy the feed URL, submit it to Apple Podcasts and Spotify, and you are live.'
		) as string,
	},
];

// Mock episodes for the hero preview
const getSampleShow = ( translate: Translate ) => ( {
	title: translate( 'Far From Home' ) as string,
	host: 'Maya Chen',
} );

const getSampleEpisodes = ( translate: Translate ) => [
	{
		number: 4,
		title: translate( 'Lost in Lisbon: how getting turned around saved my trip' ) as string,
		duration: translate( '38 min' ) as string,
	},
	{
		number: 3,
		title: translate( 'Eating my way through Oaxaca' ) as string,
		duration: translate( '45 min' ) as string,
	},
];

function Welcome( { planTier }: WelcomeProps ) {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const plans = getPlans( translate );
	const cards = getPlanCards( planTier, plans );
	const benefits = getBenefits( translate );
	const steps = getSteps( translate );
	const sampleShow = getSampleShow( translate );
	const sampleEpisodes = getSampleEpisodes( translate );
	const isFree = planTier === 'free';
	const pricingTitle = isFree
		? ( translate( 'Get more out of podcasting with a plan upgrade' ) as string )
		: ( translate( 'Podcasting is included in your plan' ) as string );

	// Enable podcasting by sending the user to the existing Settings → Podcasting
	// flow, where picking a category writes podcasting_category_id. Returning to
	// /podcasting/[site] after that lands the user on the Episodes tab.
	const goToSettings = () => {
		const path = siteSlug ? `/settings/podcasting/${ siteSlug }` : '/settings/podcasting';
		page.show( path );
	};

	// Redirect through Calypso checkout, then back to /podcasting so the user can
	// click Enable on their now-eligible plan.
	const goToCheckout = ( planSlug: 'personal' | 'premium' | 'business' ) => {
		const returnTo = siteSlug ? `/podcasting/${ siteSlug }` : '/podcasting';
		const path = siteSlug
			? `/checkout/${ siteSlug }/${ planSlug }?redirect_to=${ encodeURIComponent( returnTo ) }`
			: `/checkout/${ planSlug }`;
		page.show( path );
	};

	return (
		<VStack spacing={ 8 } className="podcast__welcome">
			{ /* Hero */ }
			<section className="podcast__welcome-hero">
				<VStack spacing={ 4 } className="podcast__welcome-hero-copy">
					<h2 className="podcast__welcome-title">
						{ translate( 'Turn your posts into a podcast' ) }
					</h2>
					<Text variant="muted">
						{ translate(
							'Publish audio alongside your writing and get distributed to Apple Podcasts, Spotify, and every major app, without leaving your site.'
						) }
					</Text>
					<HStack justify="flex-start" expanded={ false }>
						<Button variant="primary" onClick={ goToSettings }>
							{ translate( 'Enable podcasting' ) }
						</Button>
					</HStack>
				</VStack>

				<Card className="podcast__welcome-hero-preview" aria-hidden="true">
					<CardBody>
						<VStack spacing={ 3 }>
							<HStack alignment="center" spacing={ 3 } justify="flex-start">
								<span className="podcast__welcome-hero-preview-cover">
									<Icon icon={ audio } />
								</span>
								<VStack spacing={ 0 }>
									<Text weight={ 600 }>{ sampleShow.title }</Text>
									<Text variant="muted" size={ 12 }>
										{ translate( 'by %(host)s', { args: { host: sampleShow.host } } ) }
									</Text>
									<Text variant="muted" size={ 11 }>
										{ translate( 'Apple Podcasts · Spotify · Overcast', {
											comment:
												'Hero preview directory list — names stay as proper nouns; the · separators may be re-localized.',
										} ) }
									</Text>
								</VStack>
							</HStack>
							<VStack as="ul" spacing={ 1 } className="podcast__welcome-hero-preview-episodes">
								{ sampleEpisodes.map( ( ep ) => (
									<HStack as="li" key={ ep.number } alignment="center" spacing={ 2 }>
										<Text size={ 11 } variant="muted">
											▶
										</Text>
										<Text style={ { flex: 1 } }>{ ep.title }</Text>
										<Text variant="muted" size={ 12 }>
											{ ep.duration }
										</Text>
									</HStack>
								) ) }
							</VStack>
						</VStack>
					</CardBody>
				</Card>
			</section>

			{ /* Pricing */ }
			<section className="podcast__welcome-pricing">
				<header className="podcast__section-header">
					<h2 className="podcast__section-heading">{ pricingTitle }</h2>
					<p className="podcast__section-description">
						{ isFree
							? translate( 'Compare plans and start podcasting today.' )
							: translate( 'Compare your plan with the next tier up.' ) }
					</p>
				</header>
				<HStack alignment="stretch" spacing={ 4 } wrap>
					{ cards.map( ( { plan, label } ) => {
						const isYourPlan = label === 'your-plan';
						const isRecommended = label === 'recommended';
						return (
							<Card
								key={ plan.slug }
								className="podcast__plan-card"
								style={ { flex: '1 1 280px' } }
							>
								{ label && (
									<span className={ `podcast__plan-badge-corner is-${ label }` }>
										{ isYourPlan ? translate( 'Your plan' ) : translate( 'Recommended' ) }
									</span>
								) }
								<CardBody>
									<VStack spacing={ 4 } className="podcast__plan-card-content">
										<VStack spacing={ 2 }>
											<Text size="title" weight={ 500 }>
												{ plan.name }
											</Text>
											<Text variant="muted">{ plan.blurb }</Text>
										</VStack>
										<PlanPrice rawPrice={ plan.price } currencyCode="USD" displayPerMonthNotation />
										<Button
											className="podcast__plan-cta"
											variant={ isRecommended || isYourPlan ? 'primary' : 'secondary' }
											onClick={ () => ( isYourPlan ? goToSettings() : goToCheckout( plan.slug ) ) }
										>
											{ isYourPlan
												? translate( 'Enable podcasting' )
												: translate( 'Upgrade to %(planName)s', {
														args: { planName: plan.name },
												  } ) }
										</Button>
										<VStack as="ul" spacing={ 2 } className="podcast__plan-features">
											{ plan.features.map( ( feature ) => (
												<HStack
													as="li"
													key={ feature }
													alignment="flex-start"
													justify="flex-start"
													spacing={ 2 }
													expanded={ false }
												>
													<Icon icon={ check } size={ 20 } />
													<Text>{ feature }</Text>
												</HStack>
											) ) }
										</VStack>
									</VStack>
								</CardBody>
							</Card>
						);
					} ) }
				</HStack>
			</section>

			{ /* Benefits */ }
			<HStack alignment="stretch" spacing={ 4 } wrap>
				{ benefits.map( ( b ) => (
					<Card
						key={ b.title }
						className="podcast__welcome-benefit"
						style={ { flex: '1 1 280px' } }
					>
						<CardBody>
							<VStack spacing={ 3 }>
								<span className="podcast__welcome-benefit-icon" aria-hidden="true">
									{ b.icon }
								</span>
								<Text size="title" weight={ 500 }>
									{ b.title }
								</Text>
								<Text variant="muted">{ b.body }</Text>
							</VStack>
						</CardBody>
					</Card>
				) ) }
			</HStack>

			{ /* How it works */ }
			<Card>
				<CardBody>
					<VStack spacing={ 5 }>
						<Text size="title" weight={ 500 }>
							{ translate( 'How it works' ) }
						</Text>
						<ol className="podcast__welcome-steps">
							{ steps.map( ( step ) => (
								<li key={ step.number } className="podcast__welcome-step">
									<span className="podcast__welcome-step-circle">{ step.number }</span>
									<Text weight={ 500 }>{ step.title }</Text>
									<Text variant="muted">{ step.body }</Text>
								</li>
							) ) }
						</ol>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}

export default Welcome;
