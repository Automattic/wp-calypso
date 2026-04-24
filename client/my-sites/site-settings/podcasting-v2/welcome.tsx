import { Button, Card, Modal } from '@wordpress/components';
import { Icon, audio, category, check, globe, layout, megaphone } from '@wordpress/icons';
import { useState } from 'react';

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

const PLANS: Record< 'personal' | 'premium' | 'business', PlanDef > = {
	personal: {
		slug: 'personal',
		name: 'Personal',
		blurb: 'Create your home on the web with a custom domain name.',
		price: 4,
		features: [
			'Publishing tools: podcasting and newsletter',
			'6 GB storage',
			'Free domain for one year',
			'Ad-free browsing experience for your visitors',
			'Dozens of premium themes',
			'Support from our expert team',
			'Install plugins',
		],
	},
	premium: {
		slug: 'premium',
		name: 'Premium',
		blurb: 'Build a unique website with powerful design tools.',
		price: 8,
		features: [
			'Publishing tools: podcasting and newsletter',
			'13 GB storage',
			'Free domain for one year',
			'Ad-free browsing experience for your visitors',
			'All premium themes',
			'Fast support from our expert team',
			'Premium stats',
			'Install plugins',
			'Connect Google Analytics',
			'Upload videos',
		],
	},
	business: {
		slug: 'business',
		name: 'Business',
		blurb:
			'Unlock the power of WordPress with the managed hosting platform built by WordPress experts.',
		price: 25,
		features: [
			'Publishing tools: podcasting and newsletter',
			'50 GB storage',
			'Free domain for one year',
			'Ad-free browsing experience for your visitors',
			'All premium themes',
			'Priority 24/7 support from our expert team',
			'Premium stats',
			'Install plugins',
			'Connect Google Analytics',
			'Upload videos',
			'SFTP/SSH, WP-CLI, Git commands, and GitHub Deployments',
		],
	},
};

// Show the user's plan + the next one up. Free sees Personal + Premium (Recommended).
// On paid plans the upgrade target is shown without a "Recommended" push.
// Business sees only Business.
function getPlanCards(
	tier: PlanTier
): { plan: PlanDef; label: 'your-plan' | 'recommended' | null }[] {
	if ( tier === 'free' ) {
		return [
			{ plan: PLANS.personal, label: null },
			{ plan: PLANS.premium, label: 'recommended' },
		];
	}
	if ( tier === 'personal' ) {
		return [
			{ plan: PLANS.personal, label: 'your-plan' },
			{ plan: PLANS.premium, label: null },
		];
	}
	if ( tier === 'premium' ) {
		return [
			{ plan: PLANS.premium, label: 'your-plan' },
			{ plan: PLANS.business, label: null },
		];
	}
	return [ { plan: PLANS.business, label: 'your-plan' } ];
}

const BENEFITS: { icon: React.ReactNode; title: string; body: string }[] = [
	{
		icon: <Icon icon={ megaphone } />,
		title: 'Reach listeners in every app',
		body: 'One feed distributes to Apple Podcasts, Spotify, Overcast, Pocket Casts, and every directory that accepts RSS.',
	},
	{
		icon: <Icon icon={ audio } />,
		title: 'Works with the editor you already use',
		body: 'Drop an audio block into a post, assign the podcast category, hit publish. That is the whole workflow.',
	},
	{
		icon: <Icon icon={ layout } />,
		title: 'One home for writing, email, and audio',
		body: 'One site, one audience, one subscriber list. Your posts, newsletters, and episodes all live in the same place.',
	},
];

const STEPS: { number: string; title: string; body: string }[] = [
	{
		number: '1',
		title: 'Pick a category',
		body: 'Choose or create the category that holds your episodes.',
	},
	{
		number: '2',
		title: 'Publish a post with audio',
		body: 'Add an audio block to any post and assign it to your podcast category.',
	},
	{
		number: '3',
		title: 'Submit your feed once',
		body: 'Copy the feed URL, submit it to Apple Podcasts and Spotify, and you are live.',
	},
];

const STATS: { figure: string; label: string }[] = [
	{
		figure: '546M',
		label: 'people listen to podcasts worldwide — an audience that grows every year.',
	},
	{
		figure: '80%',
		label:
			'of listeners finish most or all of an episode — deeper attention than any other format on the web.',
	},
];

// Mock episodes for the hero preview and example-feed modal
const SAMPLE_SHOW = {
	title: 'Creators Weekly',
	host: 'Jordan Lee',
	category: 'Technology',
	summary:
		'A weekly show about shipping, scaling, and selling independent creative work on the open web.',
};

const SAMPLE_EPISODES = [
	{
		number: 4,
		title: 'Shipping fast with a team of two',
		date: 'Apr 22, 2026',
		duration: '42 min',
	},
	{
		number: 3,
		title: 'How we chose a podcast host in 48 hours',
		date: 'Apr 15, 2026',
		duration: '37 min',
	},
	{
		number: 2,
		title: 'Pilot episode: what makes a weekly show work',
		date: 'Apr 8, 2026',
		duration: '29 min',
	},
	{
		number: 1,
		title: 'Trailer',
		date: 'Apr 1, 2026',
		duration: '2 min',
	},
];

function PodcastingWelcome( { onEnable, planTier, onChangePlanTier }: WelcomeProps ) {
	const [ exampleOpen, setExampleOpen ] = useState( false );

	const cards = getPlanCards( planTier );
	const isFree = planTier === 'free';
	const pricingTitle = isFree
		? 'Unlock podcasting with a plan built for creators'
		: 'Podcasting is included in your plan';

	return (
		<div className="podcasting-v2__welcome">
			{ /* Hero */ }
			<Card className="podcasting-v2__welcome-hero">
				<div className="podcasting-v2__welcome-hero-copy">
					<h2 className="podcasting-v2__welcome-title">Turn your posts into a podcast</h2>
					<p className="podcasting-v2__welcome-lede">
						Publish audio alongside your writing and get distributed to Apple Podcasts, Spotify, and
						every major app — without leaving your site.
					</p>
					<div className="podcasting-v2__welcome-actions">
						<Button variant="primary" onClick={ onEnable }>
							Enable podcasting
						</Button>
						<Button variant="link" onClick={ () => setExampleOpen( true ) }>
							See an example feed
						</Button>
					</div>
				</div>

				{ /* Mini preview panel on the right */ }
				<div className="podcasting-v2__welcome-hero-preview" aria-hidden="true">
					<div className="podcasting-v2__preview-card">
						<div className="podcasting-v2__preview-cover">
							<Icon icon={ audio } />
						</div>
						<div className="podcasting-v2__preview-meta">
							<div className="podcasting-v2__preview-show">{ SAMPLE_SHOW.title }</div>
							<div className="podcasting-v2__preview-host">by { SAMPLE_SHOW.host }</div>
							<div className="podcasting-v2__preview-badges">
								<span>Apple Podcasts</span>
								<span>Spotify</span>
								<span>Overcast</span>
							</div>
						</div>
					</div>
					<ul className="podcasting-v2__preview-episodes">
						{ SAMPLE_EPISODES.slice( 0, 2 ).map( ( ep ) => (
							<li key={ ep.number }>
								<span className="podcasting-v2__preview-play">▶</span>
								<span className="podcasting-v2__preview-ep-title">{ ep.title }</span>
								<span className="podcasting-v2__preview-ep-meta">{ ep.duration }</span>
							</li>
						) ) }
					</ul>
				</div>
			</Card>

			{ /* Pricing grid */ }
			<section className="podcasting-v2__welcome-pricing">
				<h3 className="podcasting-v2__welcome-pricing-title">{ pricingTitle }</h3>

				<div className={ `podcasting-v2__plans podcasting-v2__plans--cols-${ cards.length }` }>
					{ cards.map( ( { plan, label } ) => {
						const isRecommended = label === 'recommended';
						const isYourPlan = label === 'your-plan';
						const classes = [ 'podcasting-v2__plan' ];
						if ( isRecommended ) {
							classes.push( 'podcasting-v2__plan--recommended' );
						}
						if ( isYourPlan ) {
							classes.push( 'podcasting-v2__plan--your-plan' );
						}
						return (
							<div key={ plan.slug } className={ classes.join( ' ' ) }>
								{ label && (
									<span className="podcasting-v2__plan-ribbon">
										{ isYourPlan ? 'Your plan' : 'Recommended' }
									</span>
								) }
								<div className="podcasting-v2__plan-name">{ plan.name }</div>
								<p className="podcasting-v2__plan-blurb">{ plan.blurb }</p>
								<div className="podcasting-v2__plan-price">
									<span className="podcasting-v2__plan-currency">$</span>
									<span className="podcasting-v2__plan-amount">{ plan.price }</span>
									<span className="podcasting-v2__plan-period">/mo, billed yearly</span>
								</div>
								<Button
									variant={ isRecommended || isYourPlan ? 'primary' : undefined }
									onClick={ onEnable }
								>
									{ isYourPlan ? 'Enable podcasting' : `Upgrade to ${ plan.name }` }
								</Button>
								<ul className="podcasting-v2__plan-features">
									{ plan.features.map( ( f ) => (
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
			<div className="podcasting-v2__welcome-benefits">
				{ BENEFITS.map( ( b ) => (
					<Card key={ b.title } className="podcasting-v2__welcome-benefit">
						<div className="podcasting-v2__welcome-benefit-icon">{ b.icon }</div>
						<h3 className="podcasting-v2__welcome-benefit-title">{ b.title }</h3>
						<p className="podcasting-v2__welcome-benefit-body">{ b.body }</p>
					</Card>
				) ) }
			</div>

			{ /* How it works — stacked layout, connector runs between circles only */ }
			<Card className="podcasting-v2__welcome-steps">
				<h3 className="podcasting-v2__welcome-steps-title">How it works</h3>
				<ol className="podcasting-v2__welcome-steps-grid">
					{ STEPS.map( ( step ) => (
						<li key={ step.number } className="podcasting-v2__welcome-step">
							<div className="podcasting-v2__welcome-step-circle">
								<span className="podcasting-v2__welcome-step-number">{ step.number }</span>
							</div>
							<div className="podcasting-v2__welcome-step-title">{ step.title }</div>
							<p className="podcasting-v2__welcome-step-body">{ step.body }</p>
						</li>
					) ) }
				</ol>
			</Card>

			{ /* Did you know */ }
			<Card className="podcasting-v2__welcome-stats">
				<h3 className="podcasting-v2__welcome-stats-title">Did you know?</h3>
				<div className="podcasting-v2__welcome-stats-grid">
					{ STATS.map( ( s ) => (
						<div key={ s.figure } className="podcasting-v2__welcome-stat">
							<div className="podcasting-v2__welcome-stat-figure">{ s.figure }</div>
							<div className="podcasting-v2__welcome-stat-label">{ s.label }</div>
						</div>
					) ) }
				</div>
			</Card>

			{ /* Prototype plan toggle */ }
			<div className="podcasting-v2__welcome-demo-toggle">
				<span>Prototype: demo plan —</span>
				{ ( [ 'free', 'personal', 'premium', 'business' ] as PlanTier[] ).map( ( tier ) => (
					<button
						key={ tier }
						type="button"
						className={ planTier === tier ? 'is-active' : '' }
						onClick={ () => onChangePlanTier( tier ) }
					>
						{ tier.charAt( 0 ).toUpperCase() + tier.slice( 1 ) }
					</button>
				) ) }
			</div>

			{ /* Example feed modal */ }
			{ exampleOpen && (
				<Modal
					title="What your feed looks like to listeners"
					onRequestClose={ () => setExampleOpen( false ) }
					className="podcasting-v2__example-dialog"
				>
					<div className="podcasting-v2__example-card">
						<div className="podcasting-v2__example-cover">
							<Icon icon={ audio } />
						</div>
						<div className="podcasting-v2__example-meta">
							<div className="podcasting-v2__example-show">{ SAMPLE_SHOW.title }</div>
							<div className="podcasting-v2__example-host">
								by { SAMPLE_SHOW.host } • { SAMPLE_SHOW.category }
							</div>
							<div className="podcasting-v2__example-summary">{ SAMPLE_SHOW.summary }</div>
						</div>
					</div>
					<div className="podcasting-v2__example-feed-url">
						<Icon icon={ category } />
						<span>
							https://{ SAMPLE_SHOW.host.toLowerCase().replace( /\s/g, '' ) }
							.com/category/podcast/feed/
						</span>
					</div>
					<ul className="podcasting-v2__example-episodes">
						{ SAMPLE_EPISODES.map( ( ep ) => (
							<li key={ ep.number }>
								<span className="podcasting-v2__example-play">▶</span>
								<div className="podcasting-v2__example-ep-body">
									<div className="podcasting-v2__example-ep-title">
										{ ep.number }. { ep.title }
									</div>
									<div className="podcasting-v2__example-ep-meta">
										{ ep.date } · { ep.duration }
									</div>
								</div>
							</li>
						) ) }
					</ul>
					<Icon icon={ globe } style={ { display: 'none' } } />
				</Modal>
			) }
		</div>
	);
}

export default PodcastingWelcome;
