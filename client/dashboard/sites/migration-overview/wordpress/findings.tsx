import { siteWordPressMigrationRunMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useHelpCenter } from '../../../app/help-center';
import { getCurrentDashboard } from '../../../app/routing';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import Notice from '../../../components/notice';
import { redirectToDashboardLink, wpcomLink } from '../../../utils/link';
import {
	AssistedHandoffLink,
	MigrationCard,
	StatusIcon,
	getChangeSourceUrl,
} from './migration-card';
import type {
	Site,
	WordPressMigrationFinding,
	WordPressMigrationStatus,
} from '@automattic/api-core';

export function Findings( {
	site,
	migration,
	onBackToSetup,
}: {
	site: Site;
	migration: WordPressMigrationStatus;
	onBackToSetup: () => void;
} ) {
	const { setShowHelpCenter } = useHelpCenter();
	const run = useMutation(
		withSnackbar( siteWordPressMigrationRunMutation( site.ID ), {
			error: __( 'Failed to continue the migration.' ),
		} )
	);

	const { findings } = migration;
	const codes = findings.map( ( { code } ) => code );
	const isFailed = migration.status === 'failed';
	const isRetry = findings.some( ( { resolution } ) => resolution !== 'accept' );
	// Only warnings mean the migration could read the source. Anything worse may be its connection.
	const hasError = isFailed || findings.some( ( { severity } ) => severity === 'failure' );

	const suggestsSourceChange = findings.some(
		( { suggested_action } ) => suggested_action === 'change_source'
	);

	const suggestsPlanChange = findings.some(
		( { suggested_action } ) => suggested_action === 'upgrade_plan'
	);
	const requiresPlanChange = findings.some(
		( { suggested_action, resolution } ) =>
			suggested_action === 'upgrade_plan' && resolution === 'retry'
	);

	const planButton = suggestsPlanChange && (
		<Button
			__next40pxDefaultSize
			variant={ requiresPlanChange ? 'primary' : 'secondary' }
			href={ getPlanUpgradeUrl( site ) }
		>
			{ requiresPlanChange ? __( 'Choose a plan' ) : __( 'Upgrade your plan' ) }
		</Button>
	);

	const getDescription = () => {
		if ( isFailed ) {
			// The findings say what went wrong themselves.
			return findings.length > 0
				? undefined
				: __( 'Something went wrong and the migration couldn’t finish.' );
		}
		return findings.length > 0
			? __( 'We checked your site and found a few things you should know about.' )
			: __( 'We checked your site and it’s ready to migrate.' );
	};

	const getStatus = () => {
		if ( hasError ) {
			return 'error';
		}
		return findings.length > 0 ? 'warning' : 'pending';
	};

	return (
		<MigrationCard
			title={ isFailed ? __( 'Your migration stopped' ) : __( 'Before we migrate your site' ) }
			description={ getDescription() }
			decoration={ <StatusIcon status={ getStatus() } /> }
			back={
				hasError
					? { label: __( 'Back to setup' ), onClick: onBackToSetup, disabled: run.isPending }
					: undefined
			}
			actions={
				<>
					{ suggestsSourceChange && (
						<Button
							__next40pxDefaultSize
							variant="primary"
							href={ getChangeSourceUrl( site, migration.source_url ) }
						>
							{ getChangeSourceLabel( findings ) }
						</Button>
					) }
					{ planButton }
					<Button
						__next40pxDefaultSize
						variant={ requiresPlanChange || suggestsSourceChange ? 'secondary' : 'primary' }
						isBusy={ run.isPending }
						disabled={ run.isPending }
						onClick={ () => run.mutate( { accept_findings: codes } ) }
					>
						{ getRunLabel( findings, isRetry ) }
					</Button>
					<Button variant="link" onClick={ () => setShowHelpCenter( true ) }>
						{ __( 'Contact us' ) }
					</Button>
				</>
			}
			note={ <AssistedHandoffLink siteSlug={ site.slug } /> }
		>
			{ findings.map( ( finding, index ) => (
				<Notice
					key={ `${ finding.code }-${ index }` }
					variant={ finding.severity === 'failure' ? 'error' : 'warning' }
					title={ finding.label }
				>
					<div className="wordpress-migration__message">{ getMessage( finding ) }</div>
				</Notice>
			) ) }
		</MigrationCard>
	);
}

// Outside the dashboard, where the site's migration lock doesn't send it straight back here.
function getPlanUpgradeUrl( site: Site ) {
	const backUrl = redirectToDashboardLink( { supportBackport: true } );
	return addQueryArgs( wpcomLink( '/setup/plan-upgrade/' ), {
		siteSlug: site.slug,
		cancel_to: backUrl,
		redirect_to: backUrl,
		dashboard: getCurrentDashboard(),
	} );
}

// A site that isn't WordPress goes back the same way, to pick the platform it's built on.
function getChangeSourceLabel( findings: WordPressMigrationFinding[] ) {
	const isNotWordPress = findings.some(
		( { code, data } ) => code === 'source_not_wordpress' && data?.platform !== 'parked'
	);
	return isNotWordPress ? __( 'Change the address or platform' ) : __( 'Change the address' );
}

// Trying again says what was fixed, for the finding that stopped the run.
function getRunLabel( findings: WordPressMigrationFinding[], isRetry: boolean ) {
	if ( ! isRetry ) {
		return __( 'Continue' );
	}

	const stoppedBy = findings.find( ( { severity } ) => severity === 'failure' );
	switch ( stoppedBy?.code ) {
		case 'source_not_wordpress':
			return stoppedBy.data?.platform === 'parked'
				? __( 'The site is live now, try again' )
				: __( 'Try again' );
		case 'source_unreachable':
			return __( 'The site is online now, try again' );
		case 'destination_needs_plan':
			return __( 'I’ve purchased a plan, continue' );
		default:
			return __( 'Try again' );
	}
}

// The server's message, except where the finding's data reads better set apart from the text.
function getMessage( { code, message, data }: WordPressMigrationFinding ) {
	if (
		code === 'source_redirect' &&
		typeof data?.from === 'string' &&
		typeof data?.to === 'string'
	) {
		return createInterpolateElement(
			__( 'Your site redirects from <from /> to <to />. Continue to migrate from <to /> instead.' ),
			{
				from: <code>{ getDisplayAddress( data.from ) }</code>,
				to: <code>{ getDisplayAddress( data.to ) }</code>,
			}
		);
	}

	return message;
}

// e.g. "https://www.example.com/" → "www.example.com". Redirects between http and https are followed, never shown.
function getDisplayAddress( url: string ) {
	return url.replace( /^https?:\/\//, '' ).replace( /\/$/, '' );
}
