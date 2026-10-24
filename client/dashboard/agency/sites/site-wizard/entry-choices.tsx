import { __ } from '@wordpress/i18n';
import { Choice } from './choices';
import EntryIllustration from './entry-illustration';
import FeatureChecklist from './feature-checklist';
import { featureIcons, hostingIcons } from './feature-icons';

export default function EntryChoices( {
	onConnect,
	onMove,
	onCreate,
	plugMotionReplay,
}: {
	onConnect: () => void;
	onMove: () => void;
	onCreate: () => void;
	plugMotionReplay?: number;
} ) {
	const options = [
		{
			kind: 'connect' as const,
			title: __( 'Connect a site' ),
			description: __(
				'Keep your current hosting and manage your WordPress sites in one dashboard.'
			),
			onClick: onConnect,
		},
		{
			kind: 'move' as const,
			title: __( 'Move a site' ),
			description: __(
				'Move to WordPress.com or Pressable hosting, on your own or with our help.'
			),
			onClick: onMove,
		},
		{
			kind: 'create' as const,
			title: __( 'Create a site' ),
			description: __(
				'Start a free development site, or choose paid hosting for your next project.'
			),
			onClick: onCreate,
		},
	];

	return (
		<div className="agency-site-wizard__choices agency-site-wizard__entry-options">
			{ options.map( ( option ) => (
				<div className="agency-site-wizard__entry-option" key={ option.kind }>
					<Choice
						illustration={
							<EntryIllustration kind={ option.kind } plugMotionReplay={ plugMotionReplay } />
						}
						title={ option.title }
						description={ option.description }
						onClick={ option.onClick }
					/>
					<FeatureChecklist
						title={ option.title }
						hideUnavailableLabels
						features={ [
							{
								label: {
									connect: __( 'Keep your current hosting' ),
									move: __( 'Switch your hosting' ),
									create: __( 'Start with fresh hosting' ),
								}[ option.kind ],
								icon: hostingIcons[ option.kind ],
								detail: {
									connect: __(
										'Your site, domain, and hosting stay where they are. You can switch to WordPress.com or Pressable later, with migration help when you’re ready.'
									),
									move: __(
										'Moving transfers your site to WordPress.com or Pressable. Choose Connect if you’d like to keep your current hosting.'
									),
									create: __(
										'A new site starts with new hosting. Choose Connect to manage a site that already has hosting.'
									),
								}[ option.kind ],
							},
							{
								label: __( 'New hosting' ),
								icon: featureIcons.hosting,
								included: option.kind !== 'connect',
								placeholderLabel: __( 'Switch hosting anytime' ),
								detail: {
									connect: __(
										'Connect with the hosting you already have. When you’re ready to switch, you can move to WordPress.com or Pressable.'
									),
									move: __(
										'Choose WordPress.com or Pressable. WordPress.com offers volume discounts as you add sites; compare the available plans before switching.'
									),
									create: __(
										'Start on WordPress.com or Pressable. WordPress.com offers volume discounts on paid hosting, plus free development sites while you build.'
									),
								}[ option.kind ],
							},
							{
								label: __( 'Multiple sites' ),
								icon: featureIcons.sites,
								included: option.kind !== 'create',
								placeholderLabel: __( 'Build one site at a time' ),
								detail: {
									connect: __(
										'Paste a list, upload a spreadsheet, or choose sites from your WordPress.com account. Pick the sites you want to connect first.'
									),
									move: __(
										'Paste a list or upload a spreadsheet, then choose the sites you want to move together. Start with a few or select them all.'
									),
									create: __(
										'Create one new site at a time, with its own hosting and setup choices.'
									),
								}[ option.kind ],
							},
							{
								label: __( 'Migration help' ),
								icon: featureIcons.migration,
								included: option.kind === 'move',
								placeholderLabel:
									option.kind === 'connect'
										? __( 'DIY with guided setup' )
										: __( 'Start fresh, no move needed' ),
								detail: {
									connect: __(
										'Connect sites yourself with guided plugin setup. If you decide to move hosting later, you can choose migration help then.'
									),
									move: __(
										'Let our team handle the migration, or use the self-service tools to move at your own pace. You’ll choose how much help you want.'
									),
									create: __(
										'Start with a fresh site and build at your own pace. Choose Move for help bringing an existing site to new hosting.'
									),
								}[ option.kind ],
							},
						] }
					/>
				</div>
			) ) }
		</div>
	);
}
