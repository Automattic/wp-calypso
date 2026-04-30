import {
	isBusinessPlan,
	isEcommercePlan,
	isPersonalPlan,
	isPremiumPlan,
} from '@automattic/calypso-products';
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
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSitePlanSlug from 'calypso/state/sites/selectors/get-site-plan-slug';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

type PlanSlug = 'personal' | 'premium' | 'business';
type PlanTier = 'free' | PlanSlug;
type Translate = ReturnType< typeof useTranslate >;

const getPlanTier = ( planSlug: string | null ): PlanTier => {
	if ( ! planSlug ) {
		return 'free';
	}
	if ( isBusinessPlan( planSlug ) || isEcommercePlan( planSlug ) ) {
		return 'business';
	}
	if ( isPremiumPlan( planSlug ) ) {
		return 'premium';
	}
	if ( isPersonalPlan( planSlug ) ) {
		return 'personal';
	}
	return 'free';
};

interface PlanDef {
	slug: PlanSlug;
	name: string;
	blurb: string;
	price: number;
	features: string[];
}

type PlanCard = { plan: PlanDef; label: 'your-plan' | 'recommended' | null };

// Show the user's plan + the next one up. Free sees Personal + Premium (Recommended).
// On paid plans the upgrade target is shown without a "Recommended" push.
// Business sees only Business.
function getPlanCards( tier: PlanTier, translate: Translate ): PlanCard[] {
	const personal: PlanDef = {
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
	};
	const premium: PlanDef = {
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
	};
	const business: PlanDef = {
		slug: 'business',
		name: translate( 'Business' ) as string,
		blurb: translate( 'Scale your podcast with full hosting and developer tools.' ) as string,
		price: 25,
		features: [
			translate( '50 GB storage upgrade' ) as string,
			translate( 'Priority 24/7 support' ) as string,
			translate( 'SFTP, WP-CLI, and GitHub Deployments' ) as string,
		],
	};

	switch ( tier ) {
		case 'free':
			return [
				{ plan: personal, label: null },
				{ plan: premium, label: 'recommended' },
			];
		case 'personal':
			return [
				{ plan: personal, label: 'your-plan' },
				{ plan: premium, label: null },
			];
		case 'premium':
			return [
				{ plan: premium, label: 'your-plan' },
				{ plan: business, label: null },
			];
		case 'business':
			return [ { plan: business, label: 'your-plan' } ];
	}
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

function Welcome() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const planSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) );
	const planTier = getPlanTier( planSlug );

	const cards = getPlanCards( planTier, translate );
	const benefits = getBenefits( translate );
	const steps = getSteps( translate );
	const sampleEpisodes = [
		{
			title: translate( 'Lost in Lisbon: how getting turned around saved my trip' ) as string,
			duration: translate( '38 min' ) as string,
		},
		{
			title: translate( 'Eating my way through Oaxaca' ) as string,
			duration: translate( '45 min' ) as string,
		},
	];
	const isFree = planTier === 'free';
	const pricingTitle = isFree
		? ( translate( 'Get more out of podcasting with a plan upgrade' ) as string )
		: ( translate( 'Podcasting is included in your plan' ) as string );

	// Forward into the Settings tab with the form pre-revealed; picking a
	// category there writes podcasting_category_id and flips podcasting on.
	const goToSettings = () => {
		const path = siteSlug ? `/podcasting/settings/${ siteSlug }` : '/podcasting/settings';
		page.show( path );
	};

	// Redirect through Calypso checkout, then back to /podcasting so the user can
	// click Enable on their now-eligible plan.
	const goToCheckout = ( targetPlan: PlanSlug ) => {
		dispatch(
			recordTracksEvent( 'calypso_podcast_upgrade_clicked', {
				plan_slug: targetPlan,
				current_tier: planTier,
			} )
		);
		const returnTo = siteSlug ? `/podcasting/${ siteSlug }` : '/podcasting';
		const path = siteSlug
			? `/checkout/${ siteSlug }/${ targetPlan }?redirect_to=${ encodeURIComponent( returnTo ) }`
			: `/checkout/${ targetPlan }`;
		page.show( path );
	};

	return (
		<VStack spacing={ 8 } className="podcast__welcome">
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
									<Text weight={ 600 }>{ translate( 'Far From Home' ) }</Text>
									<Text variant="muted" size={ 12 }>
										{ translate( 'by %(host)s', { args: { host: 'Maya Chen' } } ) }
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
									<HStack as="li" key={ ep.title } alignment="center" spacing={ 2 }>
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
