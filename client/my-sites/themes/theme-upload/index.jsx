/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import FilePicker from 'components/file-picker';
import DropZone from 'components/drop-zone';
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
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import {
	isUploadInProgress,
	isUploadComplete,
	hasUploadFailed,
	getUploadedThemeId,
	getUploadProgressTotal,
	getUploadProgressLoaded,
	isInstallInProgress,
} from 'state/themes/upload-theme/selectors';
import { getTheme } from 'state/themes/selectors';
import { connectOptions } from 'my-sites/themes/theme-options';

const debug = debugFactory( 'calypso:themes:theme-upload' );

class Upload extends React.Component {

	static propTypes = {
		siteId: React.PropTypes.number,
		selectedSite: React.PropTypes.object,
		inProgress: React.PropTypes.bool,
		complete: React.PropTypes.bool,
		failed: React.PropTypes.bool,
		uploadedTheme: React.PropTypes.object,
		progressTotal: React.PropTypes.number,
		progressLoaded: React.PropTypes.number,
		installing: React.PropTypes.bool,
	};

	componentDidMount() {
		const { siteId, inProgress } = this.props;
		! inProgress && this.props.clearThemeUpload( siteId );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			const { siteId, inProgress } = this.props;
			! inProgress && this.props.clearThemeUpload( siteId );
		}
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
		if ( file.type !== 'application/zip' ) {
			notices.error( errorMessage );
			return;
		}
		debug( 'zip file:', file );

		const action = this.props.isJetpackSite
			? this.props.uploadTheme : this.props.initiateThemeTransfer;
		action( siteId, file );
	}

	onBackClick = () => {
		window.history.back();
	};

	renderDropZone() {
		const { translate } = this.props;
		const uploadPromptText = translate(
			'Do you have a custom theme to upload to your site?'
		);
		const uploadInstructionsText = translate(
			"Make sure it's a single zip file, and upload it here."
		);
		const dropText = translate(
			'Drop files or click here to upload'
		);

		return (
			<div>
				<span className="theme-upload__title">{ uploadPromptText }</span>
				<span className="theme-upload__instructions">{ uploadInstructionsText }</span>
				<div className="theme-upload__dropzone">
					<DropZone onFilesDrop={ this.onFileSelect } />
					<FilePicker accept="application/zip" onPick={ this.onFileSelect } >
						<Gridicon
							className="theme-upload__dropzone-icon"
							icon="cloud-upload"
							size={ 48 } />
						{ dropText }
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
		const installingMessage = this.props.isJetpackSite
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
				<Button href={ tryandcustomize.getUrl( theme ) }>
					{ tryandcustomize.label }
				</Button>
				<Button primary onClick={ this.onActivateClick }>
					{ activate.label }
				</Button>
			</div>
		);
	}

	render() {
		const {
			translate,
			inProgress,
			complete,
			failed,
			siteId,
			selectedSite,
			themeId,
			uploadedTheme,
		} = this.props;

		return (
			<Main>
				<QueryActiveTheme siteId={ siteId } />
				{ themeId && complete && <QueryTheme siteId={ siteId } themeId={ themeId } /> }
				<ThanksModal
					site={ selectedSite }
					source="upload" />
				<HeaderCake onClick={ this.onBackClick }>{ translate( 'Upload theme' ) }</HeaderCake>
				<Card>
					{ ! inProgress && ! complete && this.renderDropZone() }
					{ inProgress && this.renderProgressBar() }
					{ complete && ! failed && uploadedTheme && this.renderTheme() }
				</Card>
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
		return {
			siteId,
			selectedSite: getSelectedSite( state ),
			isJetpackSite: isJetpackSite( state, siteId ),
			inProgress: isUploadInProgress( state, siteId ),
			complete: isUploadComplete( state, siteId ),
			failed: hasUploadFailed( state, siteId ),
			themeId,
			uploadedTheme: getTheme( state, siteId, themeId ),
			progressTotal: getUploadProgressTotal( state, siteId ),
			progressLoaded: getUploadProgressLoaded( state, siteId ),
			installing: isInstallInProgress( state, siteId ),
		};
	},
	{ uploadTheme, clearThemeUpload, initiateThemeTransfer },
)( localize( UploadWithOptions ) );
