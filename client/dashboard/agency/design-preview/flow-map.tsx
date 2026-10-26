import type { WizardJump } from '../sites/site-wizard/use-site-wizard';

interface Node {
	label: string;
	target: WizardJump;
	children?: Node[];
}
const connect = ( step: WizardJump[ 'step' ] ): WizardJump => ( { journey: 'connect', step } );
const move = (
	step: WizardJump[ 'step' ],
	method: 'concierge' | 'self' = 'concierge'
): WizardJump => ( { journey: 'migrate', step, method } );
const create = (
	step: WizardJump[ 'step' ],
	journey: 'development' | 'hosted' = 'hosted'
): WizardJump => ( { journey, step } );
const nodes: Node[] = [
	{ label: 'Three cards', target: connect( 'start' ) },
	{
		label: 'Connect',
		target: connect( 'url' ),
		children: [
			{ label: 'Paste / spreadsheet', target: connect( 'url' ) },
			{ label: 'Review & select', target: connect( 'review' ) },
			{ label: 'WordPress.com account', target: connect( 'picker' ) },
			{ label: 'Plugin setup', target: connect( 'authorize' ) },
			{ label: 'Waiting for connection', target: connect( 'connecting' ) },
			{ label: 'Connected', target: connect( 'success' ) },
		],
	},
	{
		label: 'Move',
		target: move( 'source' ),
		children: [
			{ label: 'Paste / spreadsheet', target: move( 'source' ) },
			{ label: 'Review & select', target: move( 'review' ) },
			{ label: 'Hosting provider', target: move( 'host' ) },
			{ label: 'Migration method', target: move( 'method' ) },
			{
				label: 'Concierge',
				target: move( 'setup' ),
				children: [
					{ label: 'Hosting & payment', target: move( 'setup' ) },
					{
						label: 'Client referral sent',
						target: { ...move( 'referral-sent' ), billing: 'client' },
					},
					{ label: 'Migration requested', target: move( 'requested' ) },
					{ label: 'Review copies', target: move( 'verify' ) },
					{ label: 'Moved', target: move( 'success' ) },
				],
			},
			{
				label: 'Self-service',
				target: move( 'setup', 'self' ),
				children: [
					{ label: 'Hosting & payment', target: move( 'setup', 'self' ) },
					{ label: 'Review copies', target: move( 'verify', 'self' ) },
					{ label: 'Moved', target: move( 'success', 'self' ) },
				],
			},
		],
	},
	{
		label: 'Create',
		target: create( 'new' ),
		children: [
			{ label: 'Development or production', target: create( 'new' ) },
			{
				label: 'Free development',
				target: create( 'setup', 'development' ),
				children: [
					{ label: 'Name & address', target: create( 'setup', 'development' ) },
					{ label: 'Ready to build', target: create( 'success', 'development' ) },
				],
			},
			{
				label: 'Production',
				target: create( 'host' ),
				children: [
					{ label: 'Hosting provider', target: create( 'host' ) },
					{ label: 'WordPress.com setup', target: { ...create( 'setup' ), host: 'wpcom' } },
					{ label: 'Pressable setup', target: { ...create( 'setup' ), host: 'pressable' } },
					{ label: 'Use purchased hosting', target: { ...create( 'setup' ), billing: 'existing' } },
					{
						label: 'Client referral sent',
						target: { ...create( 'referral-sent' ), billing: 'client' },
					},
					{ label: 'Site created', target: create( 'success' ) },
				],
			},
		],
	},
];

export default function FlowMap( {
	current,
	onJump,
}: {
	current: WizardJump | null;
	onJump: ( target: WizardJump ) => void;
} ) {
	const render = ( items: Node[] ) => (
		<ul>
			{ items.map( ( node ) => {
				const active =
					current?.step === node.target.step &&
					current.journey === node.target.journey &&
					( ! node.target.method || current.method === node.target.method ) &&
					( ! node.target.host || current.host === node.target.host ) &&
					( ! node.target.billing || current.billing === node.target.billing );
				return (
					<li key={ node.label }>
						{ node.children ? (
							<details open>
								<summary>{ node.label }</summary>
								{ render( node.children ) }
							</details>
						) : (
							<button
								type="button"
								aria-current={ active ? 'step' : undefined }
								onClick={ () => onJump( node.target ) }
							>
								{ node.label }
							</button>
						) }
					</li>
				);
			} ) }
		</ul>
	);
	return (
		<nav className="agency-design-preview-panel__flows" aria-label="Jump to a flow step">
			<strong>Jump to step</strong>
			{ render( nodes ) }
		</nav>
	);
}
