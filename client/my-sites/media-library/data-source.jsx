import config from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { find, includes } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import GooglePhotosIcon from './google-photos-icon';

export class MediaLibraryDataSource extends Component {
	static propTypes = {
		source: PropTypes.string.isRequired,
		onSourceChange: PropTypes.func.isRequired,
		disabledSources: PropTypes.array,
		ignorePermissions: PropTypes.bool,
	};

	static defaultProps = {
		disabledSources: [],
		ignorePermissions: false,
	};

	state = { popover: false };

	storeButtonRef = ( ref ) => ( this.buttonRef = ref );

	togglePopover = () => {
		this.setState( { popover: ! this.state.popover } );
	};

	changeSource = ( newSource ) => () => {
		if ( newSource !== this.props.source ) {
			this.props.onSourceChange( newSource );
		}
	};

	getSources = () => {
		const { disabledSources, translate, ignorePermissions, canUserUploadFiles } = this.props;
		const includeExternalMedia = ignorePermissions || canUserUploadFiles;
		const sources = [
			{
				value: '',
				labelHeader: translate( 'Media library' ),
				labelDropdown: translate( 'Media library' ),
				icon: <Gridicon icon="image" size={ 24 } />,
			},
		];
		if ( config.isEnabled( 'external-media/google-photos' ) && includeExternalMedia ) {
			sources.push( {
				value: 'google_photos',
				labelHeader: translate( 'Google Photos' ),
				labelDropdown: translate( 'Google Photos' ),
				icon: <GooglePhotosIcon />,
			} );
		}
		if ( config.isEnabled( 'external-media/free-photo-library' ) && includeExternalMedia ) {
			sources.push( {
				value: 'pexels',
				labelHeader: translate( 'Pexels free photos' ),
				labelDropdown: translate( 'Pexels free photos' ),
				icon: <Gridicon icon="image-multiple" size={ 24 } />,
			} );
		}
		return sources.filter( ( { value } ) => ! includes( disabledSources, value ) );
	};

	renderMenuItems( sources ) {
		return sources.map( ( { labelDropdown, value } ) => (
			<PopoverMenuItem key={ value } data-source={ value } onClick={ this.changeSource( value ) }>
				{ labelDropdown }
			</PopoverMenuItem>
		) );
	}

	render() {
		const { translate, source } = this.props;
		const sources = this.getSources();
		const currentSelected = find( sources, ( item ) => item.value === source );
		const classes = classnames( 'media-library__datasource', {
			'is-single-source': 1 === sources.length,
		} );
		const buttonClasses = classnames( 'button media-library__source-button', {
			'is-open': this.state.popover,
		} );

		if ( ! config.isEnabled( 'external-media' ) && ! sources.length ) {
			return null;
		}

		return (
			<div className={ classes }>
				<Button
					borderless
					ref={ this.storeButtonRef }
					className={ buttonClasses }
					onClick={ this.togglePopover }
					title={ translate( 'Choose media library source' ) }
				>
					{ currentSelected && (
						<span>
							{ currentSelected.icon } { currentSelected.labelHeader }
						</span>
					) }
					<Gridicon className="media-library__header-chevron" icon="chevron-down" size={ 18 } />
				</Button>
				{ sources.length > 1 && (
					<PopoverMenu
						context={ this.buttonRef }
						isVisible={ this.state.popover }
						position="bottom right"
						onClose={ this.togglePopover }
						className="is-dialog-visible media-library__header-popover"
					>
						{ this.renderMenuItems( sources ) }
					</PopoverMenu>
				) }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	canUserUploadFiles: canCurrentUser( state, getSelectedSiteId( state ), 'upload_files' ),
} );

export default connect( mapStateToProps )( localize( MediaLibraryDataSource ) );
