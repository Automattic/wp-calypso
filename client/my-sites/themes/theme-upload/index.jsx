/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { includes, find, isEmpty } from 'lodash';
import Gridicon from 'gridicons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import FilePicker from 'components/file-picker';
import DropZone from 'components/drop-zone';
import EmptyContent from 'components/empty-content';
import ProgressBar from 'components/progress-bar';
import Button from 'components/button';
import ThanksModal from 'my-sites/themes/thanks-modal';
import QueryCanonicalTheme from 'components/data/query-canonical-theme';
import { isATEnabled } from 'lib/automated-transfer';
// Necessary for ThanksModal
import QueryActiveTheme from 'components/data/query-active-theme';
import { localize } from 'i18n-calypso';
import notices from 'notices';
import debugFactory from 'debug';
import { uploadTheme, clearThemeUpload, initiateThemeTransfer } from 'state/themes/actions';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import {
	getSiteAdminUrl,
	isJetpackSite,
	isJetpackSiteMultiSite,
	hasJetpackSiteJetpackThemesExtendedFeatures
} from 'state/sites/selectors';
import {
	isUploadInProgress,
	isUploadComplete,
	hasUploadFailed,
	getUploadedThemeId,
	getUploadError,
	getUploadProgressTotal,
	getUploadProgressLoaded,
	isInstallInProgress,
} from 'state/themes/upload-theme/selectors';
import { getCanonicalTheme } from 'state/themes/selectors';
import { connectOptions } from 'my-sites/themes/theme-options';
import EligibilityWarnings from 'blocks/eligibility-warnings';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import { getBackPath } from 'state/themes/themes-ui/selectors';
import { hasFeature } from 'state/sites/plans/selectors';
import { FEATURE_UNLIMITED_PREMIUM_THEMES } from 'lib/plans/constants';
import QueryEligibility from 'components/data/query-atat-eligibility';
import {
	getEligibility,
	isEligibleForAutomatedTransfer
} from 'state/automated-transfer/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import WpAdminAutoLogin from 'components/wpadmin-auto-login';
import {
	MAX_UPLOADED_THEME_SIZE
} from 'lib/automated-transfer/constants';

const debug = debugFactory( 'calypso:themes:theme-upload' );

class Upload extends React.Component {

	static propTypes = {
		siteId: React.PropTypes.number,
		selectedSite: React.PropTypes.object,
		inProgress: React.PropTypes.bool,
		complete: React.PropTypes.bool,
		failed: React.PropTypes.bool,
		uploadedTheme: React.PropTypes.object,
		error: React.PropTypes.object,
		progressTotal: React.PropTypes.number,
		progressLoaded: React.PropTypes.number,
		installing: React.PropTypes.bool,
		isJetpack: React.PropTypes.bool,
		upgradeJetpack: React.PropTypes.bool,
		backPath: React.PropTypes.string,
		showEligibility: React.PropTypes.bool,
	};

	state = {
		showEligibility: this.props.showEligibility,
	}

	componentDidMount() {
		const { siteId, inProgress } = this.props;
		! inProgress && this.props.clearThemeUpload( siteId );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			const { siteId, inProgress } = nextProps;
			! inProgress && this.props.clearThemeUpload( siteId );
		}

		if ( nextProps.showEligibility !== this.props.showEligibility ) {
			this.setState( { showEligibility: nextProps.showEligibility } );
		}
	}

	onProceedClick = () => {
		this.setState( { showEligibility: false } );
	};

	componentDidUpdate( prevProps ) {
		if ( this.props.complete && ! prevProps.complete ) {
			this.successMessage();
		} else if ( this.props.failed && ! prevProps.failed ) {
			this.failureMessage();
		}
	}

	successMessage() {
		const { translate, uploadedTheme, themeId } = this.props;
		notices.success(
			translate( 'Successfully uploaded theme %(name)s', {
				args: {
					// using themeId lets us show a message before theme data arrives
					name: uploadedTheme ? uploadedTheme.name : themeId
				}
			} ),
			{ duration: 5000 }
		);
	}

	failureMessage() {
		const { translate, error } = this.props;

		debug( 'Error', { error } );

		const errorCauses = {
			exists: translate( 'Upload problem: Theme already installed on site.' ),
			already_installed: translate( 'Upload problem: Theme already installed on site.' ),
			'too large': translate( 'Upload problem: Theme zip must be under 10MB.' ),
			incompatible: translate( 'Upload problem: Incompatible theme.' ),
			unsupported_mime_type: translate( 'Upload problem: Not a valid zip file' ),
			initiate_failure: translate(
				'Upload problem: Theme may not be valid. Check that your zip file contains only the theme ' +
				'you are trying to upload.'
			),
		};

		const errorString = JSON.stringify( error ).toLowerCase();
		const cause = find( errorCauses, ( v, key ) => {
			return includes( errorString, key );
		} );

		const unknownCause = error.error ? `: ${ error.error }` : '';
		notices.error( cause || translate( 'Problem uploading theme' ) + unknownCause );
	}

	onFileSelect = ( files ) => {
		const { translate, siteId } = this.props;
		const errorMessage = translate( 'Please drop a single zip file' );

		if ( files.length !== 1 ) {
			notices.error( errorMessage );
			return;
		}

		// DropZone supplies an array, FilePicker supplies a FileList
		const file = files[ 0 ] || files.item( 0 );
		debug( 'zip file:', file );

		if ( file.size > MAX_UPLOADED_THEME_SIZE ) {
			notices.error(
				translate( 'Theme zip is too large. Please upload a theme under 50 MB.' )
			);

			return;
		}

		const action = this.props.isJetpack
			? this.props.uploadTheme : this.props.initiateThemeTransfer;
		action( siteId, file );
	}

	renderDropZone() {
		const { translate, isBusiness, isJetpack } = this.props;
		const dropText = translate(
			'Drop files or click here to upload'
		);
		const uploadInstructionsText = translate(
			'Only single .zip files are accepted.'
		);

		const themeUploadClass = classNames( 'theme-upload', {
			'is-disabled': ! isBusiness && ! isJetpack
		} );

		return (
			<div className={ themeUploadClass }>
				<div className="theme-upload__dropzone">
					<DropZone onFilesDrop={ this.onFileSelect } />
					<FilePicker accept="application/zip" onPick={ this.onFileSelect } >
						<Gridicon
							className="theme-upload__dropzone-icon"
							icon="cloud-upload"
							size={ 48 } />
						{ dropText }
						<span className="theme-upload__dropzone-instructions">{ uploadInstructionsText }</span>
					</FilePicker>
				</div>
			</div>
		);
	}

	renderProgressBar() {
		const {
			translate,
			progressTotal,
			progressLoaded,
			installing,
		} = this.props;

		const uploadingMessage = translate( 'Uploading your theme…' );
		const installingMessage = this.props.isJetpack
			? translate( 'Installing your theme…' ) : translate( 'Configuring your site…' );

		return (
			<div>
				<span className="theme-upload__title">
					{ installing ? installingMessage : uploadingMessage }
				</span>
				<ProgressBar
					value={ progressLoaded || 0 }
					total={ progressTotal || 100 }
					title={ translate( 'Uploading progress' ) }
					isPulsing={ installing }
				/>
			</div>
		);
	}

	onActivateClick = () => {
		const { activate } = this.props.options;
		activate.action( this.props.themeId );
	};

	onTryAndCustomizeClick = () => {
		const { tryandcustomize } = this.props.options;
		tryandcustomize.action( this.props.themeId );
	}

	renderTheme() {
		const { uploadedTheme: theme, translate, options } = this.props;
		const { tryandcustomize, activate } = options;

		return (
			<div className="theme-upload__theme-sheet">
				<img className="theme-upload__screenshot" src={ theme.screenshot } />
				<h2 className="theme-upload__theme-name">{ theme.name }</h2>
				<div className="theme-upload__author">
					{ translate( 'by ' ) }
					<a href={ theme.author_uri }>{ theme.author }</a>
				</div>
				<div className="theme-upload__description">{ theme.description }</div>
				<div className="theme-upload__action-buttons">
					<Button onClick={ this.onTryAndCustomizeClick } >
						{ tryandcustomize.label }
					</Button>
					<Button primary onClick={ this.onActivateClick }>
						{ activate.label }
					</Button>
				</div>
			</div>
		);
	}

	renderUploadCard() {
		const { inProgress, failed, uploadedTheme, complete } = this.props;
		return (
			<Card>
				{ ! inProgress && ! complete && this.renderDropZone() }
				{ inProgress && this.renderProgressBar() }
				{ complete && ! failed && uploadedTheme && this.renderTheme() }
				{ complete && this.props.isSiteAutomatedTransfer && <WpAdminAutoLogin site={ this.props.selectedSite } /> }
			</Card>
		);
	}

	renderNotAvailableForMultisite() {
		return (
			<EmptyContent
				title={ this.props.translate( 'Not available for multi site' ) }
				line={ this.props.translate( 'Use the WP Admin interface instead' ) }
				action={ this.props.translate( 'Open WP Admin' ) }
				actionURL={ this.props.siteAdminUrl }
				illustration={ '/calypso/images/drake/drake-jetpack.svg' }
			/>
		);
	}

	renderNotAvailable() {
		return (
			<EmptyContent
				title={ this.props.translate( 'Upload not available for this site' ) }
				line={ this.props.translate( 'Please select a different site' ) }
				action={ this.props.translate( 'Back to themes' ) }
				actionURL={ this.props.backPath }
				illustration={ '/calypso/images/drake/drake-whoops.svg' }
			/>
		);
	}

	render() {
		const {
			translate,
			complete,
			siteId,
			themeId,
			upgradeJetpack,
			backPath,
			isJetpack,
			isMultisite
		} = this.props;

		const { showEligibility } = this.state;

		if ( isMultisite ) {
			return this.renderNotAvailableForMultisite();
		}

		if ( ! isJetpack && ! this.props.atEnabled ) {
			return this.renderNotAvailable();
		}

		return (
			<Main>
				<QueryEligibility siteId={ siteId } />
				<QueryActiveTheme siteId={ siteId } />
				{ themeId && complete && <QueryCanonicalTheme siteId={ siteId } themeId={ themeId } /> }
				<ThanksModal source="upload" />
				<HeaderCake backHref={ backPath }>{ translate( 'Upload theme' ) }</HeaderCake>
				{ upgradeJetpack && <JetpackManageErrorPage
					template="updateJetpack"
					siteId={ siteId }
					featureExample={ this.renderUploadCard() }
					version="4.7" /> }
				{ showEligibility && <EligibilityWarnings
					backUrl={ backPath }
					onProceed={ this.onProceedClick } /> }
				{ ! upgradeJetpack && ! showEligibility && this.renderUploadCard() }
			</Main>
		);
	}
}

const ConnectedUpload = connectOptions( Upload );

const UploadWithOptions = ( props ) => {
	const { siteId, uploadedTheme } = props;
	return (
		<ConnectedUpload { ...props }
			siteId={ siteId }
			theme={ uploadedTheme } />
	);
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSelectedSite( state );
		const themeId = getUploadedThemeId( state, siteId );
		const isJetpack = isJetpackSite( state, siteId );
		const { eligibilityHolds, eligibilityWarnings } = getEligibility( state, siteId );
		// Use this selector to take advantage of eligibility card placeholders
		// before data has loaded.
		const isEligible = isEligibleForAutomatedTransfer( state, siteId );
		const hasEligibilityMessages = ! (
			isEmpty( eligibilityHolds ) &&
			isEmpty( eligibilityWarnings )
		);
		return {
			siteId,
			isBusiness: hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES ),
			selectedSite: site,
			isJetpack,
			inProgress: isUploadInProgress( state, siteId ),
			complete: isUploadComplete( state, siteId ),
			failed: hasUploadFailed( state, siteId ),
			themeId,
			isMultisite: isJetpackSiteMultiSite( state, siteId ),
			uploadedTheme: getCanonicalTheme( state, siteId, themeId ),
			error: getUploadError( state, siteId ),
			progressTotal: getUploadProgressTotal( state, siteId ),
			progressLoaded: getUploadProgressLoaded( state, siteId ),
			installing: isInstallInProgress( state, siteId ),
			upgradeJetpack: isJetpack && ! hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId ),
			backPath: getBackPath( state ),
			showEligibility: ! isJetpack && ( hasEligibilityMessages || ! isEligible ),
			isSiteAutomatedTransfer: isSiteAutomatedTransfer( state, siteId ),
			siteAdminUrl: getSiteAdminUrl( state, siteId ),
			atEnabled: isATEnabled( site )
		};
	},
	{ uploadTheme, clearThemeUpload, initiateThemeTransfer },
)( localize( UploadWithOptions ) );
