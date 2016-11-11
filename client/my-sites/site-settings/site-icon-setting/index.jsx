/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SiteIcon from 'components/site-icon';
import Button from 'components/button';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import AsyncLoad from 'components/async-load';
import Dialog from 'components/dialog';
import { isJetpackSite, getCustomizerUrl, getSiteAdminUrl } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isEnabled } from 'config';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import InfoPopover from 'components/info-popover';
import { addQueryArgs } from 'lib/url';

class SiteIconSetting extends Component {
	static propTypes = {
		translate: PropTypes.func,
		siteId: PropTypes.number,
		isJetpack: PropTypes.bool,
		customizerUrl: PropTypes.string,
		generalOptionsUrl: PropTypes.string
	};

	state = {
		isModalVisible: false
	};

	toggleModal = ( isModalVisible ) => this.setState( { isModalVisible } );

	hideModal = () => this.toggleModal( false );

	showModal = () => this.toggleModal( true );

	setSiteIcon = ( media ) => {
		// [TODO]: Handle setting site icon
		console.log( media ); // eslint-disable-line no-console

		this.hideModal();
	};

	preloadModal() {
		asyncRequire( 'post-editor/media-modal' );
	}

	render() {
		const { translate, siteId, isJetpack, customizerUrl, generalOptionsUrl } = this.props;
		const { isModalVisible } = this.state;
		const isIconManagementEnabled = isEnabled( 'manage/site-settings/site-icon' );

		let buttonProps;
		if ( isIconManagementEnabled ) {
			buttonProps = {
				type: 'button',
				onClick: this.showModal,
				onMouseEnter: this.preloadModal
			};
		} else {
			buttonProps = { rel: 'external' };

			if ( isJetpack ) {
				buttonProps.href = addQueryArgs( {
					'autofocus[section]': 'title_tagline'
				}, customizerUrl );
			} else {
				buttonProps.href = generalOptionsUrl;
				buttonProps.target = '_blank';
			}
		}

		return (
			<FormFieldset className="site-icon-setting">
				<FormLabel className="site-icon-setting__heading">
					{ translate( 'Site Icon' ) }
					<InfoPopover position="bottom right">
						{ translate( 'A browser and app icon for your site.' ) }
					</InfoPopover>
				</FormLabel>
				{ React.createElement( buttonProps.href ? 'a' : 'button', {
					...buttonProps,
					className: 'site-icon-setting__icon'
				}, <SiteIcon size={ 96 } siteId={ siteId } /> ) }
				<Button
					{ ...buttonProps }
					className="site-icon-setting__change-button"
					compact>
					{ translate( 'Change', { context: 'verb' } ) }
				</Button>
				{ isIconManagementEnabled && isModalVisible && (
					<MediaLibrarySelectedData siteId={ siteId }>
						<AsyncLoad
							require="post-editor/media-modal"
							placeholder={ (
								<Dialog
									additionalClassNames="editor-media-modal"
									isVisible />
							) }
							siteId={ siteId }
							onClose={ this.setSiteIcon }
							enabledFilters={ [ 'images' ] }
							visible
							single />
					</MediaLibrarySelectedData>
				) }
			</FormFieldset>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		isJetpack: isJetpackSite( state, siteId ),
		customizerUrl: getCustomizerUrl( state, siteId ),
		generalOptionsUrl: getSiteAdminUrl( state, siteId, 'options-general.php' )
	};
} )( localize( SiteIconSetting ) );
