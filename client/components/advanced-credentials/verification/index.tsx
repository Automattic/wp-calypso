import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { useSelector } from 'calypso/state';
import { CredentialsTestProgress as Progress } from 'calypso/state/data-layer/wpcom/activity-log/update-credentials/vendor';
import getJetpackCredentialsUpdateError, {
	UpdateError,
} from 'calypso/state/selectors/get-jetpack-credentials-update-error';
import getJetpackCredentialsUpdateProgress from 'calypso/state/selectors/get-jetpack-credentials-update-progress';
import getJetpackCredentialsUpdateStatus from 'calypso/state/selectors/get-jetpack-credentials-update-status';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

interface Props {
	onFinishUp: () => void;
	onReview: () => void;
	redirectOnFinish?: boolean;
	targetSite: null | string;
}

const ERROR_CODES_FOR_BLOCKED_REQUEST = [ 'service_unavailable', 'invalid_credentials' ];

const UpdateErrorView: FunctionComponent< UpdateError > = ( {
	wpcomError,
	translatedError,
	transportError,
} ) => {
	const translate = useTranslate();
	const transportMessage = transportError?.message;
	const wpcomMessage = wpcomError?.message;
	const showTransportMessage = ( transportMessage ?? wpcomMessage ) !== wpcomMessage;

	return (
		<div className="verification__error">
			<p>{ translatedError }</p>
			<details>
				<summary>{ translate( 'More details' ) }</summary>
				{ ERROR_CODES_FOR_BLOCKED_REQUEST.includes( String( wpcomError?.code ) ) ? (
					<ol>
						<li>{ wpcomMessage }</li>
						<li>
							{ translate(
								'Please {{b}}ask your hosting provider to allow connections{{/b}} from the IP addresses found on this page: %(url)s',
								{
									components: {
										b: <b />,
									},
									args: {
										url: 'https://jetpack.com/support/how-to-add-jetpack-ips-allowlist/',
									},
								}
							) }
						</li>
					</ol>
				) : (
					<>
						<p>
							{ wpcomMessage }{ ' ' }
							<span>{ `[${ wpcomError?.code }, ${ JSON.stringify( wpcomError?.data ) }]` }</span>
						</p>
						{ showTransportMessage && <p>{ transportMessage }</p> }
					</>
				) }
			</details>
		</div>
	);
};

const Verification: FunctionComponent< Props > = ( {
	onFinishUp,
	onReview,
	redirectOnFinish = true,
	targetSite = null,
} ) => {
	const translate = useTranslate();

	const siteSlug = useSelector( getSelectedSiteSlug ) as string;
	const siteId = useSelector( getSelectedSiteId );
	const updateError = useSelector( ( state ) => getJetpackCredentialsUpdateError( state, siteId ) );
	const updateProgress = useSelector( ( state ) =>
		getJetpackCredentialsUpdateProgress( state, siteId )
	);

	// TODO @azabani change this when implementing proper success/failure screens
	const updateStatus = useSelector( ( state ) =>
		getJetpackCredentialsUpdateStatus( state, siteId )
	);
	const showFinishUp = updateStatus === 'success';
	const showReview = updateStatus === 'failed';

	const stepLabels = new Map( [
		[ 'check jetpack site', translate( 'Checking Jetpack site' ) ],
		[ 'check public host', translate( 'Checking public host' ) ],
		[ 'connect', translate( 'Connecting to server' ) ],
		[ 'authenticate', translate( 'Authenticating with server' ) ],
		[ 'find wordpress', translate( 'Locating WordPress installation' ) ],
		[ 'save special paths', translate( 'Saving path settings' ) ],
		[ 'disconnect', translate( 'Disconnecting' ) ],
	] );

	return (
		<div>
			<div className="verification__title">
				<h3>
					{ translate( 'Establishing a connection to {{strong}}%(targetSite)s{{/strong}}.', {
						args: {
							targetSite: targetSite ? targetSite : siteSlug,
						},
						components: {
							strong: <strong />,
						},
					} ) }
				</h3>
			</div>
			<ul className="verification__step-list">
				{ updateProgress.steps.map( ( step ) => {
					const [ className, icon ] = {
						[ Progress.StepState.Waiting ]: [ 'verification__step-waiting', 'ellipsis' ],
						[ Progress.StepState.Active ]: [ 'verification__step-active', 'chevron-right' ],
						[ Progress.StepState.Good ]: [ 'verification__step-good', 'checkmark' ],
						[ Progress.StepState.Bad ]: [ 'verification__step-bad', 'cross' ],
					}[ step.state ] ?? [ 'verification__step-unknown', 'notice' ];

					return (
						<li key={ step.label } className={ clsx( 'verification__step-item', className ) }>
							<Gridicon icon={ icon } />
							{ stepLabels.has( step.label ) ? stepLabels.get( step.label ) : step.label }
						</li>
					);
				} ) }
			</ul>
			{ updateError && <UpdateErrorView { ...updateError } /> }
			<div className="verification__buttons">
				{ showFinishUp && (
					<Button
						primary
						onClick={ onFinishUp }
						href={ redirectOnFinish ? settingsPath( siteSlug ) : '#' }
					>
						{ redirectOnFinish ? translate( 'Finish up' ) : translate( 'Continue' ) }
					</Button>
				) }
				{ showReview && (
					<Button primary onClick={ onReview }>
						{ translate( 'Review credentials' ) }
					</Button>
				) }
			</div>
		</div>
	);
};

export default Verification;
