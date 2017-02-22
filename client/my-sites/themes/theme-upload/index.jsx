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
import QueryTheme from 'components/data/query-theme';
// Necessary for ThanksModal
import QueryActiveTheme from 'components/data/query-active-theme';
import { localize } from 'i18n-calypso';
import notices from 'notices';
import debugFactory from 'debug';
import { uploadTheme, clearThemeUpload, initiateThemeTransfer } from 'state/themes/actions';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import {
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
import { getTheme } from 'state/themes/selectors';
import { connectOptions } from 'my-sites/themes/theme-options';
import EligibilityWarnings from 'blocks/eligibility-warnings';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import { getBackPath } from 'state/themes/themes-ui/selectors';
import { hasFeature } from 'state/sites/plans/selectors';
import Banner from 'components/banner';
import { PLAN_BUSINESS, FEATURE_UNLIMITED_PREMIUM_THEMES, FEATURE_UPLOAD_THEMES } from 'lib/plans/constants';
import QueryEligibility from 'components/data/query-atat-eligibility';
import {
	getEligibility,
	isEligibleForAutomatedTransfer
} from 'state/automated-transfer/selectors';

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

		debug( 'Error', error );

		const errorCauses = {
			exists: translate( 'Upload problem: Theme already installed on site.' ),
			'Too Large': translate( 'Upload problem: Zip file too large to upload.' ),
			incompatible: translate( 'Upload problem: Incompatible theme.' ),
		};

		const errorString = JSON.stringify( error );
		const cause = find( errorCauses, ( v, key ) => {
			return includes( errorString, key );
		} );

		notices.error( cause || translate( 'Problem uploading theme' ) );
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

		const validFileType = file.type === 'application/zip' || file.type === 'application/x-zip-compressed';
		debug( 'file mime: ', file.type );

		if ( ! validFileType ) {
			notices.error( errorMessage );
			return;
		}
		debug( 'zip file:', file );

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
		activate.action( this.props.uploadedTheme );
	};

	onTryAndCustomizeClick = () => {
		const { tryandcustomize } = this.props.options;
		tryandcustomize.action( this.props.uploadedTheme );
	}

	renderTheme() {
		const { uploadedTheme: theme, translate, options } = this.props;
		const { tryandcustomize, activate } = options;

		return (
			<div className="theme-upload__theme-sheet">
				<span className="theme-upload__theme-name">{ theme.name }</span>
				<span className="theme-upload__author">
					{ translate( 'by ' ) }
					<a href={ theme.author_uri }>{ theme.author }</a>
				</span>
				<img src={ theme.screenshot } />
				<span className="theme-upload__description">{ theme.description }</span>
				<Button onClick={ this.onTryAndCustomizeClick } >
					{ tryandcustomize.label }
				</Button>
				<Button primary onClick={ this.onActivateClick }>
					{ activate.label }
				</Button>
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
			</Card>
		);
	}

	renderNotAvailable() {
		return (
			<EmptyContent
				title={ this.props.translate( 'Sorry, themes upload is not yet available for multi-site installations.' ) }
			/>
		);
	}

	render() {
		const {
			translate,
			complete,
			siteId,
			selectedSite,
			themeId,
			upgradeJetpack,
			backPath,
			isBusiness,
			isJetpack,
			isMultisite
		} = this.props;

		const { showEligibility } = this.state;

		if ( isMultisite ) {
			return this.renderNotAvailable();
		}

		return (
			<Main>
				<QueryEligibility siteId={ siteId } />
				<QueryActiveTheme siteId={ siteId } />
				{ themeId && complete && <QueryTheme siteId={ siteId } themeId={ themeId } /> }
				<ThanksModal
					site={ selectedSite }
					source="upload" />
				<HeaderCake backHref={ backPath }>{ translate( 'Upload theme' ) }</HeaderCake>
				{ ! isBusiness && ! isJetpack && <Banner
					feature={ FEATURE_UPLOAD_THEMES }
					plan={ PLAN_BUSINESS }
					title={ translate( 'To upload themes, upgrade to Business Plan' ) }
					description={ translate( 'Unlimited themes, advanced customization, no ads, live chat support, and more!' ) } /> }
				{ upgradeJetpack && <JetpackManageErrorPage
					template="updateJetpack"
					siteId={ siteId }
					featureExample={ this.renderUploadCard() }
					version="4.4.2" /> }
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
			theme={ uploadedTheme }
			options={ [ 'tryandcustomize', 'activate' ] } />
	);
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
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
			selectedSite: getSelectedSite( state ),
			isJetpack,
			inProgress: isUploadInProgress( state, siteId ),
			complete: isUploadComplete( state, siteId ),
			failed: hasUploadFailed( state, siteId ),
			themeId,
			isMultisite: isJetpackSiteMultiSite( state, siteId ),
			uploadedTheme: getTheme( state, siteId, themeId ),
			error: getUploadError( state, siteId ),
			progressTotal: getUploadProgressTotal( state, siteId ),
			progressLoaded: getUploadProgressLoaded( state, siteId ),
			installing: isInstallInProgress( state, siteId ),
			upgradeJetpack: isJetpack && ! hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId ),
			backPath: getBackPath( state ),
			showEligibility: ! isJetpack && ( hasEligibilityMessages || ! isEligible ),
		};
	},
	{ uploadTheme, clearThemeUpload, initiateThemeTransfer },
)( localize( UploadWithOptions ) );
