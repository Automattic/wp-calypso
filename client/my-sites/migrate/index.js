import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, redirectWithoutSite, sites, siteSelection } from 'calypso/my-sites/controller';
import { migrateSite, setSiteSelectionHeader, setStep } from 'calypso/my-sites/migrate/controller';
import { AnalyzerStep, InstructionsStep, MigrateGuruFlow } from './migrate-guru-flow';

export default function () {
	page(
		'/migrate-guru',
		setSiteSelectionHeader,
		siteSelection,
		navigation,
		sites,
		makeLayout,
		clientRender
	);

	page(
		'/migrate-guru/:site_id',
		siteSelection,
		navigation,
		( context, next ) => {
			context.primary = <AnalyzerStep />;
			next();
		},
		makeLayout,
		clientRender
	);

	page(
		'/migrate-guru/instructions/:site_id',
		siteSelection,
		navigation,
		( context, next ) => {
			context.primary = <InstructionsStep />;
			next();
		},
		makeLayout,
		clientRender
	);

	page(
		'/migrate',
		setSiteSelectionHeader,
		siteSelection,
		navigation,
		sites,
		makeLayout,
		clientRender
	);

	page(
		'/migrate/:site_id',
		setStep( 'input' ),
		siteSelection,
		navigation,
		redirectWithoutSite( '/migrate' ),
		migrateSite,
		makeLayout,
		clientRender
	);

	page(
		'/migrate/from/:sourceSiteId/to/:site_id',
		setStep( 'confirm' ),
		siteSelection,
		navigation,
		redirectWithoutSite( '/migrate' ),
		migrateSite,
		makeLayout,
		clientRender
	);

	page(
		'/migrate/choose/:site_id',
		setStep( 'migrateOrImport' ),
		siteSelection,
		navigation,
		redirectWithoutSite( '/migrate' ),
		migrateSite,
		makeLayout,
		clientRender
	);

	page(
		'/migrate/upgrade/from/:sourceSiteId/to/:site_id',
		setStep( 'upgrade' ),
		siteSelection,
		navigation,
		redirectWithoutSite( '/migrate' ),
		migrateSite,
		makeLayout,
		clientRender
	);

	// Fallback to handle /migrate/* routes that aren't previously matched
	page( '/migrate/*', () => page.redirect( '/migrate' ) );
}
