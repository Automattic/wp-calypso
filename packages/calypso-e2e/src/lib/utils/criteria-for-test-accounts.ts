import type { FeatureCriteria } from './get-test-account-by-feature';

const defaultCriteria: FeatureCriteria[] = [
	{
		gutenberg: 'edge',
		target: 'simple',
		accountName: 'gutenbergSimpleSiteEdgeUser',
	},
	{ gutenberg: 'stable', target: 'simple', accountName: 'gutenbergSimpleSiteUser' },
	// The CoBlocks account name takes precedence if CoBlocks edge
	// is present. We have two definitions below to effectivelly
	// ignore gutenberg in this case:
	{
		coblocks: 'edge',
		gutenberg: 'stable',
		target: 'simple',
		accountName: 'coBlocksSimpleSiteEdgeUser',
	},
	{
		coblocks: 'edge',
		gutenberg: 'edge',
		target: 'simple',
		accountName: 'coBlocksSimpleSiteEdgeUser',
	},
	{
		gutenberg: 'stable',
		target: 'simple',
		variant: 'siteEditor',
		accountName: 'siteEditorSimpleSiteUser',
	},
	{
		gutenberg: 'edge',
		target: 'simple',
		variant: 'siteEditor',
		accountName: 'siteEditorSimpleSiteEdgeUser',
	},
	{
		gutenberg: 'stable',
		target: 'atomic',
		variant: 'siteEditor',
		accountName: 'gutenbergAtomicSiteUser',
	},
	{
		gutenberg: 'edge',
		target: 'atomic',
		variant: 'siteEditor',
		accountName: 'gutenbergAtomicSiteEdgeUser',
	},
	{
		gutenberg: 'stable',
		target: 'atomic',
		accountName: 'gutenbergAtomicSiteUser',
	},
	{
		gutenberg: 'edge',
		target: 'atomic',
		accountName: 'gutenbergAtomicSiteEdgeUser',
	},
	{ gutenberg: 'edge', variant: 'i18n', target: 'simple', accountName: 'i18nUser' },
	{ gutenberg: 'stable', variant: 'i18n', target: 'simple', accountName: 'i18nUser' },
	// we're effectivelly ignoring the atomic target here, by pointing to the same
	// simple site even if "atomic"
	{ gutenberg: 'edge', variant: 'i18n', target: 'atomic', accountName: 'i18nUser' },
	{ gutenberg: 'stable', variant: 'i18n', target: 'atomic', accountName: 'i18nUser' },
];

export default defaultCriteria;
