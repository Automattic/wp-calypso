import page from '@automattic/calypso-router';
import { Button, Card, Modal } from '@wordpress/components';
import { Icon, audio, category, check, layout, megaphone } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export type PlanTier = 'free' | 'personal' | 'premium' | 'business';

interface WelcomeProps {
	onEnable: () => void;
	planTier: PlanTier;
	onChangePlanTier: ( tier: PlanTier ) => void;
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
		blurb: translate( 'Create your home on the web with a custom domain name.' ) as string,
		price: 4,
		features: [
			translate( 'Publishing tools: Podcast and Newsletter' ) as string,
			translate( '6 GB storage' ) as string,
			translate( 'Free domain for one year' ) as string,
			translate( 'Ad-free browsing experience for your visitors' ) as string,
			translate( 'Dozens of premium themes' ) as string,
			translate( 'Support from our expert team' ) as string,
			translate( 'Install plugins' ) as string,
		],
	},
	premium: {
		slug: 'premium',
		name: translate( 'Premium' ) as string,
		blurb: translate( 'Build a unique website with powerful design tools.' ) as string,
		price: 8,
		features: [
			translate( 'Publishing tools: Podcast and Newsletter' ) as string,
			translate( '13 GB storage' ) as string,
			translate( 'Free domain for one year' ) as string,
			translate( 'Ad-free browsing experience for your visitors' ) as string,
			translate( 'All premium themes' ) as string,
			translate( 'Fast support from our expert team' ) as string,
			translate( 'Premium stats' ) as string,
			translate( 'Install plugins' ) as string,
			translate( 'Connect Google Analytics' ) as string,
			translate( 'Upload videos' ) as string,
		],
	},
	business: {
		slug: 'business',
		name: translate( 'Business' ) as string,
		blurb: translate(
			'Unlock the power of WordPress with the managed hosting platform built by WordPress experts.'
		) as string,
		price: 25,
		features: [
			translate( 'Publishing tools: Podcast and Newsletter' ) as string,
			translate( '50 GB storage' ) as string,
			translate( 'Free domain for one year' ) as string,
			translate( 'Ad-free browsing experience for your visitors' ) as string,
			translate( 'All premium themes' ) as string,
			translate( 'Priority 24/7 support from our expert team' ) as string,
			translate( 'Premium stats' ) as string,
			translate( 'Install plugins' ) as string,
			translate( 'Connect Google Analytics' ) as string,
			translate( 'Upload videos' ) as string,
			translate( 'SFTP/SSH, WP-CLI, Git commands, and GitHub Deployments' ) as string,
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

// Mock episodes for the hero preview and example-feed modal
const getSampleShow = ( translate: Translate ) => ( {
	title: translate( 'Far From Home' ) as string,
	host: 'Maya Chen',
	category: translate( 'Places & Travel' ) as string,
	summary: translate(
		'A weekly travel show about long bus rides, market food, and the strangers who make a place feel like home.'
	) as string,
} );

const getSampleEpisodes = ( translate: Translate ) => [
	{
		number: 4,
		title: translate( 'Lost in Lisbon: how getting turned around saved my trip' ) as string,
		date: 'Apr 22, 2026',
		duration: translate( '38 min' ) as string,
	},
	{
		number: 3,
		title: translate( 'Eating my way through Oaxaca' ) as string,
		date: 'Apr 15, 2026',
		duration: translate( '45 min' ) as string,
	},
	{
		number: 2,
		title: translate( 'Pilot: One backpack, six months' ) as string,
		date: 'Apr 8, 2026',
		duration: translate( '32 min' ) as string,
	},
	{
		number: 1,
		title: translate( 'Trailer' ) as string,
		date: 'Apr 1, 2026',
		duration: translate( '2 min' ) as string,
	},
];

function Welcome( { onEnable, planTier, onChangePlanTier }: WelcomeProps ) {
	const translate = useTranslate();
	const [ exampleOpen, setExampleOpen ] = useState( false );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const plans = getPlans( translate );
	const cards = getPlanCards( planTier, plans );
	const benefits = getBenefits( translate );
	const steps = getSteps( translate );
	const sampleShow = getSampleShow( translate );
	const sampleEpisodes = getSampleEpisodes( translate );
	const isFree = planTier === 'free';
	const tierLabels: Record< PlanTier, string > = {
		free: translate( 'Free' ) as string,
		personal: translate( 'Personal' ) as string,
		premium: translate( 'Premium' ) as string,
		business: translate( 'Business' ) as string,
	};
	const pricingTitle = isFree
		? ( translate( 'Unlock podcasting with a plan built for creators' ) as string )
		: ( translate( 'Podcasting is included in your plan' ) as string );

	// Redirect through Calypso checkout, then back to /podcast so the user can
	// click Enable on their now-eligible plan.
	const goToCheckout = ( planSlug: 'personal' | 'premium' | 'business' ) => {
		const returnTo = siteSlug ? `/podcast/${ siteSlug }` : '/podcast';
		const path = siteSlug
			? `/checkout/${ siteSlug }/${ planSlug }?redirect_to=${ encodeURIComponent( returnTo ) }`
			: `/checkout/${ planSlug }`;
		page.show( path );
	};

	return (
		<div className="podcast__welcome">
			{ /* Hero */ }
			<section className="podcast__welcome-hero">
				<div className="podcast__welcome-hero-copy">
					<h2 className="podcast__welcome-title">
						{ translate( 'Turn your posts into a podcast' ) }
					</h2>
					<p className="podcast__welcome-lede">
						{ translate(
							'Publish audio alongside your writing and get distributed to Apple Podcasts, Spotify, and every major app, without leaving your site.'
						) }
					</p>
					<div className="podcast__welcome-actions">
						{ ! isFree && (
							<>
								<Button variant="primary" onClick={ onEnable }>
									{ translate( 'Enable podcasting' ) }
								</Button>
								<Button variant="link" onClick={ () => setExampleOpen( true ) }>
									{ translate( 'See an example feed' ) }
								</Button>
							</>
						) }
					</div>
				</div>

				{ /* Mini preview panel on the right */ }
				<div className="podcast__welcome-hero-preview" aria-hidden="true">
					<div className="podcast__preview-card">
						<div className="podcast__preview-cover">
							<Icon icon={ audio } />
						</div>
						<div className="podcast__preview-meta">
							<div className="podcast__preview-show">{ sampleShow.title }</div>
							<div className="podcast__preview-host">
								{ translate( 'by %(host)s', { args: { host: sampleShow.host } } ) }
							</div>
							<div className="podcast__preview-badges">
								<span>Apple Podcasts</span>
								<span>Spotify</span>
								<span>Overcast</span>
							</div>
						</div>
					</div>
					<ul className="podcast__preview-episodes">
						{ sampleEpisodes.slice( 0, 2 ).map( ( ep ) => (
							<li key={ ep.number }>
								<span className="podcast__preview-play">▶</span>
								<span className="podcast__preview-ep-title">{ ep.title }</span>
								<span className="podcast__preview-ep-meta">{ ep.duration }</span>
							</li>
						) ) }
					</ul>
				</div>
			</section>

			{ /* Pricing grid */ }
			<section className="podcast__welcome-pricing">
				<h3 className="podcast__welcome-pricing-title">{ pricingTitle }</h3>

				<div className={ `podcast__plans podcast__plans--cols-${ cards.length }` }>
					{ cards.map( ( { plan, label }, index ) => {
						const isRecommended = label === 'recommended';
						const isYourPlan = label === 'your-plan';
						const classes = [ 'podcast__plan' ];
						if ( isRecommended ) {
							classes.push( 'podcast__plan--recommended' );
						}
						if ( isYourPlan ) {
							classes.push( 'podcast__plan--your-plan' );
						}
						// Right column shows the first two features (Publishing tools + storage)
						// always, then only features that aren't already on the left card —
						// so the upgrade is easy to scan at a glance.
						const leftFeatures = index === 1 ? cards[ 0 ].plan.features : [];
						const features =
							index === 1
								? plan.features.filter( ( f, i ) => i < 2 || ! leftFeatures.includes( f ) )
								: plan.features;
						return (
							<div key={ plan.slug } className={ classes.join( ' ' ) }>
								{ label && (
									<span className="podcast__plan-ribbon">
										{ isYourPlan ? translate( 'Your plan' ) : translate( 'Recommended' ) }
									</span>
								) }
								<div className="podcast__plan-name">{ plan.name }</div>
								<p className="podcast__plan-blurb">{ plan.blurb }</p>
								<div className="podcast__plan-price">
									<span className="podcast__plan-currency">$</span>
									<span className="podcast__plan-amount">{ plan.price }</span>
									<span className="podcast__plan-period">
										{ translate( '/mo, billed yearly' ) }
									</span>
								</div>
								<Button
									variant={ isRecommended || isYourPlan ? 'primary' : 'secondary' }
									onClick={ () => ( isYourPlan ? onEnable() : goToCheckout( plan.slug ) ) }
								>
									{ isYourPlan
										? translate( 'Enable podcasting' )
										: translate( 'Upgrade to %(planName)s', {
												args: { planName: plan.name },
										  } ) }
								</Button>
								<ul className="podcast__plan-features">
									{ features.map( ( f ) => (
										<li key={ f }>
											<Icon icon={ check } />
											<span>{ f }</span>
										</li>
									) ) }
								</ul>
							</div>
						);
					} ) }
				</div>
			</section>

			{ /* Benefits */ }
			<div className="podcast__welcome-benefits">
				{ benefits.map( ( b ) => (
					<article key={ b.title } className="podcast__welcome-benefit">
						<span className="podcast__welcome-benefit-icon" aria-hidden="true">
							{ b.icon }
						</span>
						<h3 className="podcast__welcome-benefit-title">{ b.title }</h3>
						<p className="podcast__welcome-benefit-body">{ b.body }</p>
					</article>
				) ) }
			</div>

			{ /* How it works — stacked layout, connector runs between circles only */ }
			<Card className="podcast__welcome-steps">
				<h3 className="podcast__welcome-steps-title">{ translate( 'How it works' ) }</h3>
				<ol className="podcast__welcome-steps-grid">
					{ steps.map( ( step ) => (
						<li key={ step.number } className="podcast__welcome-step">
							<div className="podcast__welcome-step-circle">
								<span className="podcast__welcome-step-number">{ step.number }</span>
							</div>
							<div className="podcast__welcome-step-title">{ step.title }</div>
							<p className="podcast__welcome-step-body">{ step.body }</p>
						</li>
					) ) }
				</ol>
			</Card>

			{ /* Prototype plan toggle */ }
			<div className="podcast__welcome-demo-toggle">
				<span>{ translate( 'Prototype: demo plan -' ) }</span>
				{ ( [ 'free', 'personal', 'premium', 'business' ] as PlanTier[] ).map( ( tier ) => (
					<button
						key={ tier }
						type="button"
						className={ planTier === tier ? 'is-active' : '' }
						aria-pressed={ planTier === tier }
						onClick={ () => onChangePlanTier( tier ) }
					>
						{ tierLabels[ tier ] }
					</button>
				) ) }
			</div>

			{ /* Example feed modal */ }
			{ exampleOpen && (
				<Modal
					title={ translate( 'What your feed looks like to listeners' ) as string }
					onRequestClose={ () => setExampleOpen( false ) }
					className="podcast__example-dialog"
				>
					<div className="podcast__example-card">
						<div className="podcast__example-cover">
							<Icon icon={ audio } />
						</div>
						<div className="podcast__example-meta">
							<div className="podcast__example-show">{ sampleShow.title }</div>
							<div className="podcast__example-host">
								{ translate( 'by %(host)s', { args: { host: sampleShow.host } } ) } •{ ' ' }
								{ sampleShow.category }
							</div>
							<div className="podcast__example-summary">{ sampleShow.summary }</div>
						</div>
					</div>
					<div className="podcast__example-feed-url">
						<Icon icon={ category } />
						<span>
							https://{ sampleShow.host.toLowerCase().replace( /\s/g, '' ) }
							.com/category/podcast/feed/
						</span>
					</div>
					<ul className="podcast__example-episodes">
						{ sampleEpisodes.map( ( ep ) => (
							<li key={ ep.number }>
								<span className="podcast__example-play">▶</span>
								<div className="podcast__example-ep-body">
									<div className="podcast__example-ep-title">
										{ ep.number }. { ep.title }
									</div>
									<div className="podcast__example-ep-meta">
										{ ep.date } · { ep.duration }
									</div>
								</div>
							</li>
						) ) }
					</ul>
				</Modal>
			) }
		</div>
	);
}

export default Welcome;
