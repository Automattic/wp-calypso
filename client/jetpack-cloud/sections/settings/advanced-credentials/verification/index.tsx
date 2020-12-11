/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import getJetpackCredentialsUpdateError, {
	UpdateError,
} from 'calypso/state/selectors/get-jetpack-credentials-update-error';
import getJetpackCredentialsUpdateProgress from 'calypso/state/selectors/get-jetpack-credentials-update-progress';
import { CredentialsTestProgress as Progress } from 'calypso/state/data-layer/wpcom/activity-log/update-credentials/vendor';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';
import getJetpackCredentialsUpdateStatus from 'calypso/state/selectors/get-jetpack-credentials-update-status';

interface Props {
	formSubmissionError: Error | null;
	formSubmissionStatus: 'unsubmitted' | 'pending' | 'success' | 'failed';
	onFinishUp: () => void;
	onReview: () => void;
}

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
				<p>
					{ wpcomMessage }{ ' ' }
					<span>{ `[${ wpcomError?.code }, ${ JSON.stringify( wpcomError?.data ) }]` }</span>
				</p>
				{ showTransportMessage && <p>{ transportMessage }</p> }
			</details>
		</div>
	);
};

const Verification: FunctionComponent< Props > = ( { onFinishUp, onReview } ) => {
	const translate = useTranslate();

	const siteSlug = useSelector( getSelectedSiteSlug );
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
					{ translate( 'Establishing a connection to {{strong}}%(siteSlug)s{{/strong}}.', {
						args: {
							siteSlug,
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
						<li key={ step.label } className={ classNames( 'verification__step-item', className ) }>
							<Gridicon icon={ icon } />
							{ stepLabels.has( step.label ) ? stepLabels.get( step.label ) : step.label }
						</li>
					);
				} ) }
			</ul>
			{ updateError && <UpdateErrorView { ...updateError } /> }
			<div className="verification__buttons">
				{ showFinishUp && (
					<Button primary onClick={ onFinishUp } href={ settingsPath( siteSlug || undefined ) }>
						{ translate( 'Finish up' ) }
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
